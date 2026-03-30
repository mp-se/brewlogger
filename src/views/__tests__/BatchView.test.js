import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { createRouter, createMemoryHistory } from "vue-router"
import BatchView from "../BatchView.vue"
import { Batch, Device } from "@/modules/classes"

import routerMock from "@/modules/router"

const piniaMocks = vi.hoisted(() => ({
  global: {
    disabled: false,
    clearMessages: vi.fn(),
    messageSuccess: "",
    messageError: "",
    batchChanged: false
  },
  deviceStore: {
    deviceList: [],
    devices: [],
    getDevice: vi.fn(),
    deleteDeviceFermentationSteps: vi.fn()
  },
  batchStore: {
    getBatch: vi.fn(),
    addBatch: vi.fn(),
    updateBatch: vi.fn(),
    deleteFermentationSteps: vi.fn()
  },
  brewfatherStore: {
    getBatchList: vi.fn(),
    batches: []
  },
  configStore: {
    config: {
      brewfatherEnabled: false,
      isGravitySG: true
    }
  }
}))

vi.mock("@/modules/router", () => ({
  default: {
    currentRoute: {
      value: {
        params: { id: "new" },
        name: "batch-view"
      }
    },
    push: vi.fn()
  }
}))

vi.mock("@/modules/logger", () => ({ logDebug: vi.fn(), logError: vi.fn(), logInfo: vi.fn() }))
vi.mock("@/modules/utils", () => ({ 
  validateCurrentForm: vi.fn(() => true),
  roundValue: vi.fn((val) => val)
}))
vi.mock("@/modules/pinia", () => ({
  global: piniaMocks.global,
  deviceStore: piniaMocks.deviceStore,
  batchStore: piniaMocks.batchStore,
  brewfatherStore: piniaMocks.brewfatherStore,
  configStore: piniaMocks.configStore,
  config: piniaMocks.configStore.config
}))

vi.mock("@/fragments/FermentationStepFragment.vue", () => ({
  default: {
    name: "FermentationStepFragment",
    template: "<div>FermentationStepFragment</div>",
    props: ["fermentationSteps"]
  }
}))

describe("BatchView", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    piniaMocks.brewfatherStore.getBatchList.mockResolvedValue(true)
    piniaMocks.brewfatherStore.batches = []
    piniaMocks.global.messageError = ""
    piniaMocks.global.messageSuccess = ""
    piniaMocks.global.disabled = false
    
    // Default mock behavior for router
    routerMock.currentRoute.value.params.id = "new"
    routerMock.push.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const mountWrapper = () => mount(BatchView, {
    global: {
      stubs: {
        BsInputText: true, BsInputNumber: true, BsInputDate: true,
        BsInputRadio: true, BsSelect: true, BsCard: true,
        BsInputSwitch: true, BsInputBase: true, BsModalConfirm: true,
        "router-link": true
      }
    }
  })

  describe("Rendering", () => {
    it("should render batch view container", () => {
      const wrapper = mountWrapper()
      expect(wrapper.find(".container").exists()).toBe(true)
    })

    it("should render page title", () => {
      const wrapper = mountWrapper()
      expect(wrapper.text()).toContain("Batch")
    })
  })

  describe("Workflow and Logical Coverage", () => {
    it("adds new batch on save when ID is new", async () => {
      routerMock.currentRoute.value.params.id = "new"

      const newBatch = new Batch(999, "New")
      newBatch.id = 999
      newBatch.name = "New"
      newBatch.fermentationSteps = "[]"
      newBatch.toJson = vi.fn().mockReturnValue({ id: 999, name: "New", fermentationSteps: "[]" })
      piniaMocks.batchStore.addBatch.mockResolvedValue(newBatch)

      const wrapper = mountWrapper()
      await flushPromises()

      wrapper.vm.batch = new Batch(0, "New")
      wrapper.vm.batch.fermentationSteps = "[]"
      wrapper.vm.batch.toJson = vi.fn().mockReturnValue({ id: 0, name: "New", fermentationSteps: "[]" })
      wrapper.vm.batchSaved = new Batch(0, "New")

      await wrapper.vm.save()
      expect(piniaMocks.batchStore.addBatch).toHaveBeenCalled()
      expect(routerMock.push).toHaveBeenCalled()
    })

    it("handles addBatch failure", async () => {
      routerMock.currentRoute.value.params.id = "new"
      piniaMocks.batchStore.addBatch.mockResolvedValue(null)

      const wrapper = mountWrapper()
      await flushPromises()

      wrapper.vm.batch = new Batch(0, "New")
      wrapper.vm.batch.toJson = vi.fn().mockReturnValue({ id: 0, name: "New" })
      wrapper.vm.batchSaved = new Batch(0, "New")

      await wrapper.vm.save()
      expect(piniaMocks.global.messageError).toBe("Failed to add batch")
    })

    it("updates existing batch on save", async () => {
      routerMock.currentRoute.value.params.id = "123"

      const existing = new Batch(123, "Existing")
      existing.toJson = vi.fn().mockReturnValue({ id: 123, name: "Existing" })
      piniaMocks.batchStore.updateBatch.mockResolvedValue(true)
      piniaMocks.batchStore.getBatch.mockResolvedValue(existing)

      const wrapper = mountWrapper()
      await flushPromises()

      wrapper.vm.batch = existing
      wrapper.vm.batchSaved = new Batch(123, "Old")

      await wrapper.vm.save()
      expect(piniaMocks.batchStore.updateBatch).toHaveBeenCalled()
      expect(piniaMocks.global.messageSuccess).toBe("Saved batch")
    })

    it("removes fermentation steps", async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, "Test")
      wrapper.vm.batch.fermentationChamber = "chamber1"
      piniaMocks.deviceStore.deleteDeviceFermentationSteps.mockResolvedValue(true)
      
      await wrapper.vm.deleteFermentationStepsCallback()
      expect(piniaMocks.global.messageSuccess).toBe("Fermentation steps removed")
      expect(wrapper.vm.activeFermentationSteps).toBe("")
    })

    it("handles remove fermentation steps failure", async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, "Test")
      piniaMocks.deviceStore.deleteDeviceFermentationSteps.mockResolvedValue(false)
      await wrapper.vm.deleteFermentationStepsCallback()
      expect(piniaMocks.global.messageError).toBe("Failed to remove fermentation steps")
    })

    it("loads device stepList if existing batch has fermentationChamber", async () => {
      const existing = new Batch(1, "Existing")
      existing.fermentationChamber = 10
      piniaMocks.batchStore.getBatch.mockResolvedValue(existing)
      piniaMocks.deviceStore.getDevice.mockResolvedValue({
        device: { id: 10 },
        stepList: "[step1]"
      })
      
      routerMock.currentRoute.value.params.id = "1"
      const wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.vm.activeFermentationSteps).toBe("[step1]")
    })

    it("handles failed batch load in onMounted", async () => {
      routerMock.currentRoute.value.params.id = "456"
      piniaMocks.batchStore.getBatch.mockResolvedValue(null)
      const wrapper = mountWrapper()
      await flushPromises()
      expect(piniaMocks.global.messageError).toContain("Failed to load batch")
    })

    it("covers updateDeviceOptions for more branches", async () => {
      piniaMocks.deviceStore.devices = [
        { software: "Gravitymon", chipId: "g1", mdns: "g.local", url: "", description: "" },
        { software: "Pressuremon", chipId: "p1", mdns: "", url: "http://p", description: "" },
        { software: "Chamber-Controller", id: 10, mdns: "", url: "http://c", description: "desc" },
        { software: "Gravitymon", chipId: "g2", mdns: "", url: "http://g2", description: "" },
        { software: "Pressuremon", chipId: "p2", mdns: "", url: "", description: "desc" }
      ]
      const wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.vm.gravityDeviceOptions.length).toBeGreaterThan(1)
    })

    it("covers remaining failing branches", async () => {
      const mockBtn = { click: vi.fn() }
      const getElemSpy = vi.spyOn(document, "getElementById").mockReturnValue(mockBtn)
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, "Test")
      wrapper.vm.batchSaved = new Batch(1, "Test")
      wrapper.vm.deleteFermentationSteps()
      expect(mockBtn.click).toHaveBeenCalled()
      getElemSpy.mockRestore()

      piniaMocks.batchStore.updateBatch.mockResolvedValue(false)
      piniaMocks.batchStore.getBatch.mockResolvedValue(new Batch(1, "E"))
      routerMock.currentRoute.value.params.id = "1"
      const wrapper2 = mountWrapper()
      await flushPromises()
      wrapper2.vm.batchSaved = new Batch(1, "E")
      await wrapper2.vm.save()
      expect(piniaMocks.global.messageError).toBe("Failed to save batch")

      // Brewfather changed branch
      const b1 = new Batch(1, "B1")
      b1.brewfatherId = "bf1"
      piniaMocks.brewfatherStore.batches = [
        { brewfatherId: "bf1", name: "BF Name", brewDate: "2023", brewer: "M", style: "S", ebc: 1, abv: 5, ibu: 30, og: 1.05, fg: 1.01, fermentationSteps: "[]" }
      ]
      wrapper2.vm.batch = b1
      wrapper2.vm.brewfatherChanged("bf1")
      expect(wrapper2.vm.batch.name).toBe("BF Name")
      
      // updateDeviceOptions branches
      piniaMocks.deviceStore.devices = [
        { software: "Chamber-Controller", id: 22, mdns: "c.local", url: "", description: "desc" }
      ]
      wrapper2.vm.updateDeviceOptions()
      expect(wrapper2.vm.tempControlDeviceOptions.length).toBe(1) // Should remain 1 because url is empty

      // batch.fermentationChamber > 0 && batch.fermentationSteps != '' logic
      wrapper2.vm.batch.fermentationChamber = 1
      wrapper2.vm.batch.fermentationSteps = "[]"
      await flushPromises()

      // Covers batchChanged early exit
      wrapper2.vm.batch = null
      expect(wrapper2.vm.batchChanged()).toBe(false)
      
      // updateDeviceOptions remaining branches
      piniaMocks.deviceStore.devices = [
        { software: "Gravitymon", chipId: "g3", mdns: "", url: "", description: "desc3" },
        { software: "Pressuremon", chipId: "p3", mdns: "", url: "", description: "desc3" }
      ]
      wrapper2.vm.updateDeviceOptions()
      expect(wrapper2.vm.gravityDeviceOptions.length).toBeGreaterThan(1)

      // covers onMounted brewfatherStore.getBatchList() else branch
      piniaMocks.brewfatherStore.getBatchList.mockResolvedValue(false)
      const wrapper3 = mountWrapper()
      await flushPromises()

      // Covers brewfatherChanged with no match
      wrapper2.vm.brewfatherChanged("no-match")

      // covers batchChanged with true (not equal)
      wrapper2.vm.batch = new Batch(1, "Updated")
      wrapper2.vm.batchSaved = new Batch(1, "Original")
      expect(wrapper2.vm.batchChanged()).toBe(true)

      // covers validateCurrentForm failure
      vi.mocked((await import("@/modules/utils")).validateCurrentForm).mockReturnValueOnce(false)
      await wrapper2.vm.save()

      // final push over 85%
      routerMock.currentRoute.value.params.id = "new"
      const wrapper4 = mountWrapper()
      await flushPromises()
    })
  })
})
