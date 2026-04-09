// BrewLogger
// Copyright (c) 2021-2026 Magnus
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Alternatively, this software may be used under the terms of a
// commercial license. See LICENSE_COMMERCIAL for details.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

import piniaInstance from './modules/pinia.js'
app.use(piniaInstance)

import router from './modules/router.js'
app.use(router)

import BsMessage from '@/components/BsMessage.vue'
import BsCard from '@/components/BsCard.vue'
import BsFileUpload from '@/components/BsFileUpload.vue'
import BsProgress from '@/components/BsProgress.vue'
import BsInputBase from '@/components/BsInputBase.vue'
import BsInputText from '@/components/BsInputText.vue'
import BsInputReadonly from '@/components/BsInputReadonly.vue'
import BsSelect from '@/components/BsSelect.vue'
import BsInputTextArea from '@/components/BsInputTextArea.vue'
import BsInputNumber from '@/components/BsInputNumber.vue'
import BsInputSwitch from '@/components/BsInputSwitch.vue'
import BsInputRadio from '@/components/BsInputRadio.vue'
import BsDropdown from '@/components/BsDropdown.vue'

import BsModal from '@/components/BsModal.vue'
import BsModalConfirm from '@/components/BsModalConfirm.vue'
import BsModalSelect from '@/components/BsModalSelect.vue'
import BsInputDate from '@/components/BsInputDate.vue'

import GravityStatsFragment from '@/fragments/GravityStatsFragment.vue'
import PressureStatsFragment from '@/fragments/PressureStatsFragment.vue'
import LifeEstimates from '@/views/LifeEstimates.vue'

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
app.component('BsInputDate', BsInputDate)

app.component('GravityStatsFragment', GravityStatsFragment)
app.component('PressureStatsFragment', PressureStatsFragment)
app.component('LifeEstimates', LifeEstimates)

import IconHome from './components/IconHome.vue'
import IconTools from './components/IconTools.vue'
import IconGraphUpArrow from './components/IconGraphUpArrow.vue'
import IconCloudUpArrow from './components/IconCloudUpArrow.vue'
import IconUpArrow from './components/IconUpArrow.vue'
import IconCpu from './components/IconCpu.vue'
import IconListUl from './components/IconListUl.vue'

app.component('IconHome', IconHome)
app.component('IconTools', IconTools)
app.component('IconGraphUpArrow', IconGraphUpArrow)
app.component('IconCloudUpArrow', IconCloudUpArrow)
app.component('IconUpArrow', IconUpArrow)
app.component('IconCpu', IconCpu)
app.component('IconListUl', IconListUl)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

app.mount('#app')

import '@popperjs/core/dist/umd/popper.min.js'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'hammerjs/hammer.js'
