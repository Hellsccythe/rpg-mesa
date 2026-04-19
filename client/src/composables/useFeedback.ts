import { ref } from 'vue'

export function useFeedback(duration = 4000) {
  const feedback = ref('')
  const feedbackIsError = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function showFeedback(message: string, isError = false) {
    if (timer) clearTimeout(timer)
    feedback.value = message
    feedbackIsError.value = isError
    if (duration > 0) {
      timer = setTimeout(() => {
        feedback.value = ''
      }, duration)
    }
  }

  function clearFeedback() {
    if (timer) clearTimeout(timer)
    feedback.value = ''
    feedbackIsError.value = false
  }

  return { feedback, feedbackIsError, showFeedback, clearFeedback }
}
