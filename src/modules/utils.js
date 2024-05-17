import { ref } from 'vue'
import { config } from "@/modules/pinia"

export function validateCurrentForm() {
  let valid = true
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    if (!form.checkValidity())
      valid = false

    form.classList.add('was-validated')
  })

  return valid
}

export const abv = (og, fg) => {
  return Math.round((76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794)*100) / 100
}

export const gravityToPlato = (sg) => {
  return 259 - (259 / sg)
}

export function tempToF(c) {
  return (c * 1.8) + 32.0
}

export function tempToC(f) {
  return (f - 32.0) / 1.8
}

export function isValidJson(s) {
  try {
    JSON.stringify(JSON.parse(s))
    return true
  } catch (e) {
  }

  return false
}

export function isValidMqttData(s) {
  return false // Used in common components so it needs to be defined
}

export function isValidFormData(s) {
  return false // Used in common components so it needs to be defined
}

export function download(content, mimeType, filename) {
  const a = document.createElement('a')
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  a.setAttribute('href', url)
  a.setAttribute('download', filename)
  a.click()
}
