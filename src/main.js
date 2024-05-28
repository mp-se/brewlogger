import "bootstrap/dist/css/bootstrap.min.css"
import "@popperjs/core/dist/umd/popper.min.js"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "bootstrap-icons/font/bootstrap-icons.css"
import { createApp } from 'vue'
import { piniaInstance } from "@/modules/pinia"
import App from '@/App.vue'
import { router } from '@/modules/router'

const app = createApp(App)
app.use(router).use(piniaInstance)

import BsIcon from '@/components/BsIcon'
import BsMessage from '@/components/BsMessage'
import BsCard from '@/components/BsCard'
import BsFileUpload from '@/components/BsFileUpload'
import BsProgress from '@/components/BsProgress'
import BsInputBase from '@/components/BsInputBase'
import BsInputText from '@/components/BsInputText'
import BsInputReadonly from '@/components/BsInputReadonly'
import BsSelect from '@/components/BsSelect'
import BsInputTextArea from '@/components/BsInputTextArea'
import BsInputNumber from '@/components/BsInputNumber'
import BsInputSwitch from '@/components/BsInputSwitch'
import BsInputRadio from '@/components/BsInputRadio'
import BsDropdown from '@/components/BsDropdown'

import BsModal from '@/components2/BsModal'
import BsModalConfirm from '@/components2/BsModalConfirm'
import BsModalSelect from '@/components2/BsModalSelect'

app.component('BsIcon', BsIcon)
app.component('BsMessage', BsMessage)
app.component('BsDropdown', BsDropdown)
app.component('BsCard', BsCard)
app.component('BsFileUpload', BsFileUpload)
app.component('BsProgress', BsProgress)
app.component('BsInputBase', BsInputBase)
app.component('BsInputText', BsInputText)
app.component('BsInputReadonly', BsInputReadonly)
app.component('BsSelect', BsSelect)
app.component('BsInputTextArea', BsInputTextArea)
app.component('BsInputNumber', BsInputNumber)
app.component('BsInputRadio', BsInputRadio)
app.component('BsInputSwitch', BsInputSwitch)

app.component('BsModal', BsModal)
app.component('BsModalConfirm', BsModalConfirm)
app.component('BsModalSelect', BsModalSelect)

app.mount('#app')