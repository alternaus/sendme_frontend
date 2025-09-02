import { computed, readonly,ref } from 'vue'

import { type GenericObject,useForm } from 'vee-validate'
import * as yup from 'yup'

export interface StepConfig<T = GenericObject> {
  id: string
  label: string
  icon?: string
  fields: Array<keyof T>
  schema: yup.ObjectSchema<Partial<T>>
}

export interface StepperFormOptions<T extends GenericObject> {
  steps: StepConfig<T>[]
  initialValues: Partial<T>
  validateOnMount?: boolean
}

export function useFormStepper<T extends GenericObject>(
  options: StepperFormOptions<T>
) {
  const firstStepId = options.steps[0]?.id ?? '1'
  const currentStep = ref(firstStepId)
  const visitedSteps = ref<Set<string>>(new Set([firstStepId]))

  const stepMap = new Map(options.steps.map(step => [step.id, step]))

  const combinedSchema = yup.object().shape(
    options.steps.reduce((acc, step) => {
      const stepFields = step.schema.fields || {}
      return { ...acc, ...stepFields }
    }, {})
  )

  const {
    defineField: _defineField,
    handleSubmit: _handleSubmit,
    resetForm,
    errors,
    setValues: _setValues,
    values,
    validate: _validate,
    setFieldError
  } = useForm<Record<string, unknown>>({
    initialValues: options.initialValues as Record<string, unknown>,
    validateOnMount: options.validateOnMount ?? false
  })

  //Type-safe defineField wrapper
  const defineField = <K extends keyof T>(name: K) => {
    return _defineField(String(name))
  }

  //Type-safe setValues wrapper
  const setValues = (newValues: Partial<T>) => {
    _setValues(newValues as Record<string, unknown>)
  }

  const currentStepIndex = computed(() =>
    options.steps.findIndex(step => step.id === currentStep.value)
  )

  const currentStepConfig = computed(() =>
    stepMap.get(currentStep.value)
  )

  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === options.steps.length - 1)

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepConfig = currentStepConfig.value
    if (!stepConfig) return true

    try {
      const stepValues = Object.fromEntries(
        stepConfig.fields.map(field => [field, (values as T)[field]])
      )

      await stepConfig.schema.validate(stepValues, { abortEarly: false })

      stepConfig.fields.forEach(field => {
        const errorKey = String(field)
        if (errors.value[errorKey]) {
          setFieldError(errorKey, undefined)
        }
      })

      return true
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        validationError.inner.forEach(error => {
          if (error.path && stepConfig.fields.includes(error.path as keyof T)) {
            setFieldError(error.path, error.message)
          }
        })
      }
      return false
    }
  }

  const goToStep = async (stepId: string, skipValidation = false): Promise<boolean> => {
    if (!skipValidation && !(await validateCurrentStep())) {
      return false
    }

    currentStep.value = stepId
    visitedSteps.value.add(stepId)
    return true
  }

  const nextStep = async (): Promise<boolean> => {
    const currentIndex = currentStepIndex.value
    if (currentIndex < options.steps.length - 1) {
      return goToStep(options.steps[currentIndex + 1].id)
    }
    return false
  }

  const prevStep = async (): Promise<boolean> => {
    const currentIndex = currentStepIndex.value
    if (currentIndex > 0) {
      return goToStep(options.steps[currentIndex - 1].id, true)
    }
    return false
  }

  const canNavigateToStep = (stepId: string): boolean => {
    return visitedSteps.value.has(stepId)
  }

  const hasStepErrors = (stepId: string): boolean => {
    const stepConfig = stepMap.get(stepId)
    if (!stepConfig) return false

    return stepConfig.fields.some(field => {
      const errorKey = String(field)
      const errorObj = errors.value as Record<string, string | undefined>
      return Boolean(errorObj[errorKey])
    })
  }

  const validateStep = async (stepId: string): Promise<boolean> => {
    const stepConfig = stepMap.get(stepId)
    if (!stepConfig) return true

    try {
      const stepValues = Object.fromEntries(
        stepConfig.fields.map(field => [field, (values as T)[field]])
      )

      await stepConfig.schema.validate(stepValues, { abortEarly: false })

      stepConfig.fields.forEach(field => {
        const errorKey = String(field)
        if (errors.value[errorKey]) {
          setFieldError(errorKey, undefined)
        }
      })

      return true
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        validationError.inner.forEach(error => {
          if (error.path && stepConfig.fields.includes(error.path as keyof T)) {
            setFieldError(error.path, error.message)
          }
        })
      }
      return false
    }
  }

  const handleSubmit = (
    onSubmit: (values: T) => void | Promise<void>,
    onError?: (errors: Record<string, string>) => void
  ) => {
    return _handleSubmit(async (values) => {
      try {
        const validatedValues = await combinedSchema.validate(values, { abortEarly: false })
        await onSubmit(validatedValues as T)
      } catch (error) {
        if (onError && error instanceof yup.ValidationError) {
          const errorMap: Record<string, string> = {}
          error.inner.forEach(err => {
            if (err.path) {
              errorMap[err.path] = err.message
            }
          })
          onError(errorMap)
        }
      }
    })
  }

  return {
    currentStep: readonly(currentStep),
    currentStepIndex,
    isFirstStep,
    isLastStep,

    defineField,
    handleSubmit,
    resetForm,
    errors,
    setValues,

    nextStep,
    prevStep,
    goToStep,
    canNavigateToStep,
    hasStepErrors,
    validateCurrentStep,
    validateStep,

    steps: options.steps,
    visitedSteps
  }
}
