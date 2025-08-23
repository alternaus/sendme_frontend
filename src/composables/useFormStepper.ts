import { computed, readonly, ref } from 'vue'

import type { PartialDeep } from 'type-fest'
import { useForm } from 'vee-validate'
import * as yup from 'yup'

// Tipos auxiliares
type StepId = string
type FieldName = string
type ErrorMap = Record<string, string | undefined>

/**
 * Configuración de un paso del formulario multi-step
 */
export interface StepConfig {
  /** Identificador único del paso */
  id: StepId
  /** Etiqueta visible del paso */
  label: string
  /** Icono opcional para mostrar en el paso */
  icon?: string
  /** Lista de nombres de campos que pertenecen a este paso */
  fields: FieldName[]
  /** Esquema de validación Yup para este paso */
  schema: yup.AnyObjectSchema
}

/**
 * Opciones de configuración para el form stepper
 */
export interface StepperFormOptions<T extends Record<string, unknown>> {
  /** Lista de pasos del formulario */
  steps: StepConfig[]
  /** Valores iniciales del formulario */
  initialValues: PartialDeep<T>
  /** Si debe validar al montar el componente */
  validateOnMount?: boolean
}

/**
 * Hook personalizado para manejar formularios multi-step con validación por pasos.
 *
 * @template T - Tipo del objeto del formulario
 * @param options - Opciones de configuración del stepper
 * @returns Objeto con funciones y estado para manejar el formulario multi-step
 */
export const useFormStepper = <T extends Record<string, unknown>>(options: StepperFormOptions<T>) => {
  const firstId = options.steps[0]?.id ?? '1'
  const currentStep = ref<string>(firstId)
  const visitedSteps = ref<Set<string>>(new Set([firstId]))

  const stepMap: Map<string, StepConfig> = new Map(options.steps.map(s => [s.id, s]))

  const combinedSchema: yup.AnyObjectSchema = options.steps
    .map(s => s.schema)
    .reduce((acc, s) => acc.concat(s), yup.object())

  const {
    defineField,
    handleSubmit: _handleSubmit,
    resetForm,
    errors,
    values,
    setValues,
    setFieldError,
    setErrors,
    validate,
  } = useForm({
    initialValues: options.initialValues as Record<string, unknown>,
    validateOnMount: !!options.validateOnMount,
  })

  const currentStepIndex = computed<number>(() =>
    options.steps.findIndex(step => step.id === currentStep.value)
  )

  const currentStepConfig = computed<StepConfig | undefined>(() =>
    stepMap.get(currentStep.value)
  )

  const isFirstStep = computed<boolean>(() => currentStepIndex.value === 0)
  const isLastStep = computed<boolean>(() => currentStepIndex.value === options.steps.length - 1)

  const canNavigateToStep = (stepId: StepId): boolean => visitedSteps.value.has(stepId)

  // Extrae valores del paso actual sin disparar validación global
  const pickValues = (keys: readonly FieldName[]): Record<string, unknown> => {
    const src = values as unknown as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of keys) out[k] = src[k]
    return out
  }

  const validateCurrentStep = async (): Promise<boolean> => {
    const step = currentStepConfig.value
    if (!step || step.fields.length === 0) return true

    try {
      const v = pickValues(step.fields)
      await step.schema.validate(v, { abortEarly: false })
      // limpia errores del paso actual
      step.fields.forEach(f => setFieldError(f as string, undefined))
      return true
    } catch (e) {
      const ye = e as yup.ValidationError
      const map: ErrorMap = {}
      if (Array.isArray(ye.inner) && ye.inner.length > 0) {
        for (const i of ye.inner) if (i.path) map[i.path] = i.message
      } else if (ye.path) {
        map[ye.path] = ye.message
      }
      setErrors(map)
      return false
    }
  }

  const goToStep = async (stepId: StepId, skipValidation = false): Promise<boolean> => {
    if (!skipValidation) {
      const ok = await validateCurrentStep()
      if (!ok) return false
    }
    currentStep.value = stepId
    visitedSteps.value.add(stepId)
    return true
  }

  const nextStep = async (): Promise<boolean> => {
    const i = currentStepIndex.value
    if (i < 0) return false
    if (i < options.steps.length - 1) return goToStep(options.steps[i + 1].id)
    return false
  }

  const prevStep = (): Promise<boolean> => {
    const i = currentStepIndex.value
    if (i > 0) return goToStep(options.steps[i - 1].id, true)
    return Promise.resolve(false)
  }

  const handleSubmit = (
    onSubmit: (values: T) => void | Promise<void>,
    onError?: (errors: Record<string, string>) => void
  ) =>
    _handleSubmit(async (vals) => {
      try {
        const validated = await combinedSchema.validate(vals, { abortEarly: false })
        await onSubmit(validated as T)
      } catch (e) {
        const ye = e as yup.ValidationError
        const map: ErrorMap = {}
        if (Array.isArray(ye.inner) && ye.inner.length > 0) {
          for (const i of ye.inner) if (i.path) map[i.path] = i.message
        } else if (ye.path) {
          map[ye.path] = ye.message
        }
        setErrors(map)
        onError?.(map as Record<string, string>)
      }
    })

  const getStepErrors = (stepId: StepId): string[] => {
    const step = stepMap.get(stepId)
    if (!step) return []
    const errObj = errors.value as ErrorMap
    return step.fields
      .map(f => errObj[f])
      .filter((error): error is string => Boolean(error))
  }

  const hasStepErrors = (stepId: StepId): boolean => {
    const step = stepMap.get(stepId)
    if (!step) return false
    const errObj = errors.value as ErrorMap
    return step.fields.some(f => Boolean(errObj[f]))
  }

  return {
    currentStep: readonly(currentStep),
    currentStepIndex,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    visitedSteps: readonly(visitedSteps),

    defineField,
    handleSubmit,
    resetForm,
    errors,
    setValues,
    validate,

    goToStep,
    nextStep,
    prevStep,
    canNavigateToStep,

    validateCurrentStep,
    getStepErrors,
    hasStepErrors,
  }
}
