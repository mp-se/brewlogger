<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch</p>
    <hr />

    <template v-if="batch != null">
      <form @submit.prevent="save" class="needs-validation" novalidate>
        <div class="row">
          <div class="col-md-6">
            <BsInputText v-model="batch.name" label="Name" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-3">
            <BsSelect
              v-model="batch.chipIdGravity"
              label="Gravity Device"
              :options="gravityDeviceOptions"
              help=""
              :disabled="global.disabled"
            ></BsSelect>
          </div>
          <div class="col-md-3">
            <BsSelect
              v-model="batch.chipIdPressure"
              label="Pressure Device"
              :options="pressureDeviceOptions"
              help=""
              :disabled="global.disabled"
            ></BsSelect>
          </div>
          <div class="col-md-3">
            <BsSelect
              v-model="batch.fermentationChamber"
              label="Fermentation chamber"
              :options="tempControlDeviceOptions"
              help=""
              :disabled="global.disabled"
            ></BsSelect>
          </div>
          <div class="col-md-12">
            <BsInputText
              v-model="batch.description"
              label="Description"
              help=""
              :disabled="global.disabled"
            >
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsInputText v-model="batch.brewer" label="Brewer" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsInputText
              v-model="batch.brewDate"
              label="Brew date"
              help=""
              :disabled="global.disabled"
            >
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsSelect
              v-model="batch.style"
              label="Style"
              :options="styleOptions"
              help=""
              :disabled="global.disabled"
            >
            </BsSelect>
          </div>
          <div class="col-md-4">
            <BsInputRadio
              v-model="batch.active"
              :options="activeOptions"
              label="Receiving data"
              help=""
              :disabled="global.disabled"
            ></BsInputRadio>
          </div>
          <div class="col-md-4">
            <BsInputRadio
              v-model="batch.tapList"
              :options="tapListOptions"
              label="Tap list"
              help=""
              :disabled="global.disabled"
            ></BsInputRadio>
          </div>
          <div class="col-md-4">
            <BsSelect
              @change="brewfatherChanged(batch.brewfatherId)"
              v-model="batch.brewfatherId"
              label="Brewfather ID"
              :options="brewfatherOptions"
              help=""
              :disabled="global.disabled"
            >
            </BsSelect>
          </div>
          <div class="col-md-4">
            <BsInputNumber
              v-model="batch.abv"
              width="5"
              label="Alcohol"
              unit="% ABV"
              min="0"
              max="100"
              step="0.01"
              help=""
              :disabled="global.disabled"
            >
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber
              v-model="batch.ebc"
              width="5"
              label="Color"
              unit="EBC"
              min="0"
              max="100"
              step="0.1"
              help=""
              :disabled="global.disabled"
            >
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber
              v-model="batch.ibu"
              width="5"
              label="Bitterness"
              unit="IBU"
              min="0"
              max="100"
              step="0.1"
              help=""
              :disabled="global.disabled"
            >
            </BsInputNumber>
          </div>

          <div class="col-md-12" v-if="batch.fermentationSteps != ''">
            <hr />
          </div>

          <div class="col-md-12" v-if="batch.fermentationSteps != ''">
            <label class="form-label fw-bold">Fermentation Steps</label>

            <FermentationStepFragment :fermentationSteps="JSON.parse(batch.fermentationSteps)">
            </FermentationStepFragment>
          </div>
        </div>

        <div class="row gy-2">
          <div class="col-md-12">
            <hr />
          </div>
          <div class="col-md-12">
            <button
              type="submit"
              class="btn btn-primary w-2"
              :disabled="global.disabled || !batchChanged()"
            >
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                :hidden="!global.disabled"
              ></span>
              <i class="bi bi-floppy"></i>
              &nbsp;Save</button
            >&nbsp;
            <router-link :to="{ name: 'batch-list' }">
              <button type="button" class="btn btn-secondary w-2">
                <i class="bi bi-x-square"></i>
                Cancel
              </button> </router-link
            >&nbsp;

            <template v-if="batch.fermentationChamber > 0 && batch.fermentationSteps != ''">
              <router-link
                :to="{
                  name: 'batch-fermentation-control',
                  params: { id: router.currentRoute.value.params.id }
                }"
              >
                <button type="button" class="btn btn-secondary w-3">
                  Fermentation Control
                </button> </router-link
              >&nbsp;
            </template>
          </div>
        </div>
      </form>
    </template>

    <template v-else>
      <div class="row gy-2">
        <div class="col-md-12">
          <p class="h4">Loading...</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { global, deviceStore, batchStore, brewfatherStore } from '@/modules/pinia'
import { validateCurrentForm } from '@/modules/utils'
import { Batch } from '@/modules/batchStore'
import router from '@/modules/router'
import { logDebug } from '@/modules/logger'
import FermentationStepFragment from '@/fragments/FermentationStepFragment.vue'

// TODO: Add date selector

const batch = ref(null)
const batchSaved = ref(null)

const gravityDeviceOptions = ref([])
const pressureDeviceOptions = ref([])
const tempControlDeviceOptions = ref([])

const activeOptions = ref([
  { label: 'Active', value: true },
  { label: 'Closed', value: false }
])

const tapListOptions = ref([
  { label: 'Visible', value: true },
  { label: 'Hidden', value: false }
])

const brewfatherOptions = ref([{ label: '- Not connected -', value: '' }])

// These styles are imported from Brewfather definitions BJCP_2008 and GABF_2015
const styleOptions = ref([
  { label: '- undefined -', value: '' },
  { label: 'Adambier', value: 'Adambier' },
  { label: 'Aged Beer', value: 'Aged Beer' },
  { label: 'American Amber Ale', value: 'American Amber Ale' },
  { label: 'American Barleywine', value: 'American Barleywine' },
  { label: 'American Brown Ale', value: 'American Brown Ale' },
  { label: 'American Fruit Beer', value: 'American Fruit Beer' },
  { label: 'American IPA', value: 'American IPA' },
  { label: 'American Pale Ale', value: 'American Pale Ale' },
  { label: 'American Stout', value: 'American Stout' },
  { label: 'American Wheat or Rye Beer', value: 'American Wheat or Rye Beer' },
  { label: 'American-Style Amber Lager', value: 'American-Style Amber Lager' },
  { label: 'American-Style Amber Light Lager', value: 'American-Style Amber Light Lager' },
  { label: 'American-Style Amber/Red Ale', value: 'American-Style Amber/Red Ale' },
  { label: 'American-Style Barley Wine Ale', value: 'American-Style Barley Wine Ale' },
  { label: 'American-Style Black Ale', value: 'American-Style Black Ale' },
  { label: 'American-Style Brown Ale', value: 'American-Style Brown Ale' },
  { label: 'American-Style Cream Ale', value: 'American-Style Cream Ale' },
  { label: 'American-Style Dark Lager', value: 'American-Style Dark Lager' },
  { label: 'American-Style Extra Special Bitter', value: 'American-Style Extra Special Bitter' },
  { label: 'American-Style Imperial Porter', value: 'American-Style Imperial Porter' },
  { label: 'American-Style Imperial Stout', value: 'American-Style Imperial Stout' },
  { label: 'American-Style India Pale Ale', value: 'American-Style India Pale Ale' },
  { label: 'American-Style Lager', value: 'American-Style Lager' },
  { label: 'American-Style Light Lager', value: 'American-Style Light Lager' },
  { label: 'American-Style Malt Liquor', value: 'American-Style Malt Liquor' },
  { label: 'American-Style Märzen', value: 'American-Style Märzen' },
  { label: 'American-Style Pale Ale', value: 'American-Style Pale Ale' },
  { label: 'American-Style Pilsener', value: 'American-Style Pilsener' },
  { label: 'American-Style Sour Ale', value: 'American-Style Sour Ale' },
  { label: 'American-Style Stout', value: 'American-Style Stout' },
  { label: 'American-Style Strong Pale Ale', value: 'American-Style Strong Pale Ale' },
  { label: 'American-Style Wheat Wine', value: 'American-Style Wheat Wine' },
  { label: 'Applewine', value: 'Applewine' },
  { label: 'Australian-Style Pale Ale', value: 'Australian-Style Pale Ale' },
  { label: 'Baltic Porter', value: 'Baltic Porter' },
  { label: 'Baltic-Style Porter', value: 'Baltic-Style Porter' },
  { label: 'Bamberg-Style Bock Rauchbier', value: 'Bamberg-Style Bock Rauchbier' },
  { label: 'Bamberg-Style Helles Rauchbier', value: 'Bamberg-Style Helles Rauchbier' },
  { label: 'Bamberg-Style Märzen Rauchbier', value: 'Bamberg-Style Märzen Rauchbier' },
  {
    label: 'Bamberg-Style Weiss Rauchbier (Helles or Dunkel)',
    value: 'Bamberg-Style Weiss Rauchbier (Helles or Dunkel)'
  },
  { label: 'Belgian Blond Ale', value: 'Belgian Blond Ale' },
  { label: 'Belgian Dark Strong Ale', value: 'Belgian Dark Strong Ale' },
  { label: 'Belgian Dubbel', value: 'Belgian Dubbel' },
  { label: 'Belgian Fruit Beer', value: 'Belgian Fruit Beer' },
  { label: 'Belgian Golden Strong Ale', value: 'Belgian Golden Strong Ale' },
  { label: 'Belgian Pale Ale', value: 'Belgian Pale Ale' },
  { label: 'Belgian Specialty Ale', value: 'Belgian Specialty Ale' },
  { label: 'Belgian Tripel', value: 'Belgian Tripel' },
  { label: 'Belgian-Style Blonde Ale', value: 'Belgian-Style Blonde Ale' },
  { label: 'Belgian-Style Dark Strong Ale', value: 'Belgian-Style Dark Strong Ale' },
  { label: 'Belgian-Style Dubbel', value: 'Belgian-Style Dubbel' },
  {
    label: 'Belgian-Style Flanders Oud Bruin or Oud Red Ale',
    value: 'Belgian-Style Flanders Oud Bruin or Oud Red Ale'
  },
  { label: 'Belgian-Style Fruit Lambic', value: 'Belgian-Style Fruit Lambic' },
  { label: 'Belgian-Style Gueuze Lambic', value: 'Belgian-Style Gueuze Lambic' },
  { label: 'Belgian-Style Lambic', value: 'Belgian-Style Lambic' },
  { label: 'Belgian-Style Pale Ale', value: 'Belgian-Style Pale Ale' },
  { label: 'Belgian-Style Pale Strong Ale', value: 'Belgian-Style Pale Strong Ale' },
  { label: 'Belgian-Style Quadrupel', value: 'Belgian-Style Quadrupel' },
  { label: 'Belgian-Style Table Beer', value: 'Belgian-Style Table Beer' },
  { label: 'Belgian-Style Tripel', value: 'Belgian-Style Tripel' },
  { label: 'Belgian-Style Witbier', value: 'Belgian-Style Witbier' },
  { label: 'Berliner Weiss', value: 'Berliner Weiss' },
  { label: 'Berliner-Style Weisse', value: 'Berliner-Style Weisse' },
  { label: 'Biere de Garde', value: 'Biere de Garde' },
  { label: 'Blonde Ale', value: 'Blonde Ale' },
  { label: 'Bohemian Pilsener', value: 'Bohemian Pilsener' },
  { label: 'Bohemian Pilsner', value: 'Bohemian Pilsner' },
  { label: 'Braggot', value: 'Braggot' },
  { label: 'Brett Beer', value: 'Brett Beer' },
  { label: 'British-Style Barley Wine Ale', value: 'British-Style Barley Wine Ale' },
  { label: 'British-Style Imperial Stout', value: 'British-Style Imperial Stout' },
  { label: 'Brown Porter', value: 'Brown Porter' },
  { label: 'California Common Beer', value: 'California Common Beer' },
  { label: 'Chili Beer', value: 'Chili Beer' },
  { label: 'Chocolate Beer', value: 'Chocolate Beer' },
  {
    label: 'Christmas/Winter Specialty Spice Beer',
    value: 'Christmas/Winter Specialty Spice Beer'
  },
  { label: 'Classic American Pilsner', value: 'Classic American Pilsner' },
  { label: 'Classic English-Style Pale Ale', value: 'Classic English-Style Pale Ale' },
  { label: 'Classic Irish-Style Dry Stout', value: 'Classic Irish-Style Dry Stout' },
  { label: 'Classic Rauchbier', value: 'Classic Rauchbier' },
  { label: 'Coffee Beer', value: 'Coffee Beer' },
  { label: 'Common Cider', value: 'Common Cider' },
  { label: 'Common Perry', value: 'Common Perry' },
  { label: 'Contemporary Gose', value: 'Contemporary Gose' },
  { label: 'Cream Ale', value: 'Cream Ale' },
  { label: 'Cyser (Apple Melomel)', value: 'Cyser (Apple Melomel)' },
  { label: 'Dark American Lager', value: 'Dark American Lager' },
  { label: 'Dark American Wheat Beer w/ Yeast', value: 'Dark American Wheat Beer w/ Yeast' },
  {
    label: 'Dark American Wheat Beer without Yeast',
    value: 'Dark American Wheat Beer without Yeast'
  },
  { label: 'Dark American-Belgo-Style Ale', value: 'Dark American-Belgo-Style Ale' },
  { label: 'Doppelbock', value: 'Doppelbock' },
  { label: 'Dortmunder Export', value: 'Dortmunder Export' },
  { label: 'Dortmunder/Export-Style Export', value: 'Dortmunder/Export-Style Export' },
  { label: 'Double Red Ale', value: 'Double Red Ale' },
  { label: 'Dry Mead', value: 'Dry Mead' },
  { label: 'Dry Stout', value: 'Dry Stout' },
  { label: 'Dunkelweizen', value: 'Dunkelweizen' },
  { label: 'Dutch-Style Kim Beer', value: 'Dutch-Style Kim Beer' },
  { label: 'Düsseldorf Altbier', value: 'Düsseldorf Altbier' },
  { label: 'Eisbock', value: 'Eisbock' },
  { label: 'English Barleywine', value: 'English Barleywine' },
  { label: 'English Cider', value: 'English Cider' },
  { label: 'English IPA', value: 'English IPA' },
  { label: 'English-Style Brown Ale', value: 'English-Style Brown Ale' },
  { label: 'English-Style Dark Mild Ale', value: 'English-Style Dark Mild Ale' },
  { label: 'English-Style Extra Special Bitter', value: 'English-Style Extra Special Bitter' },
  { label: 'English-Style India Pale Ale', value: 'English-Style India Pale Ale' },
  { label: 'English-Style Pale Mild Ale', value: 'English-Style Pale Mild Ale' },
  { label: 'English-Style Summer Ale', value: 'English-Style Summer Ale' },
  { label: 'European-Style Dark/Münchner Dunkel', value: 'European-Style Dark/Münchner Dunkel' },
  { label: 'Experimental Beer', value: 'Experimental Beer' },
  { label: 'Export Stout', value: 'Export Stout' },
  {
    label: 'Extra Special/Strong Bitter (English Pale Ale)',
    value: 'Extra Special/Strong Bitter (English Pale Ale)'
  },
  { label: 'Field Beer', value: 'Field Beer' },
  { label: 'Flanders Brown Ale/Oud Bruin', value: 'Flanders Brown Ale/Oud Bruin' },
  { label: 'Flanders Red Ale', value: 'Flanders Red Ale' },
  { label: 'Foreign Extra Stout', value: 'Foreign Extra Stout' },
  { label: 'French Cider', value: 'French Cider' },
  { label: 'French-Style Biére de Garde', value: 'French-Style Biére de Garde' },
  { label: 'Fresh or Wet Hop Ale', value: 'Fresh or Wet Hop Ale' },
  { label: 'Fruit Beer', value: 'Fruit Beer' },
  { label: 'Fruit Cider', value: 'Fruit Cider' },
  { label: 'Fruit Lambic', value: 'Fruit Lambic' },
  { label: 'Fruit Wheat Beer', value: 'Fruit Wheat Beer' },
  { label: 'Fruited American-Style Sour Ale', value: 'Fruited American-Style Sour Ale' },
  {
    label: 'Fruited Wood- and Barrel-Aged Sour Beer',
    value: 'Fruited Wood- and Barrel-Aged Sour Beer'
  },
  { label: 'German Pilsener', value: 'German Pilsener' },
  { label: 'German Pilsner (Pils)', value: 'German Pilsner (Pils)' },
  { label: 'German-Style Altbier', value: 'German-Style Altbier' },
  { label: 'German-Style Doppelbock', value: 'German-Style Doppelbock' },
  { label: 'German-Style Eisbock', value: 'German-Style Eisbock' },
  { label: 'German-Style Heller Bock/Maibock', value: 'German-Style Heller Bock/Maibock' },
  { label: 'German-Style Kölsch', value: 'German-Style Kölsch' },
  { label: 'German-Style Leichtes Weizen', value: 'German-Style Leichtes Weizen' },
  { label: 'German-Style Märzen', value: 'German-Style Märzen' },
  { label: 'German-Style Oktoberfest', value: 'German-Style Oktoberfest' },
  { label: 'German-Style Rye Ale', value: 'German-Style Rye Ale' },
  { label: 'German-Style Schwarzbier', value: 'German-Style Schwarzbier' },
  { label: 'Ginjo Beer or Sake Yeast Beer', value: 'Ginjo Beer or Sake Yeast Beer' },
  { label: 'Gluten-Free Beer', value: 'Gluten-Free Beer' },
  { label: 'Golden or Blonde Ale', value: 'Golden or Blonde Ale' },
  { label: 'Grodziskie', value: 'Grodziskie' },
  { label: 'Gueuze', value: 'Gueuze' },
  { label: 'Herb and Spice Beer', value: 'Herb and Spice Beer' },
  { label: 'Historical Beer', value: 'Historical Beer' },
  { label: 'Honey Beer', value: 'Honey Beer' },
  { label: 'Ice Lager', value: 'Ice Lager' },
  { label: 'Imperial IPA', value: 'Imperial IPA' },
  { label: 'Imperial India Pale Ale', value: 'Imperial India Pale Ale' },
  { label: 'Imperial Red Ale', value: 'Imperial Red Ale' },
  { label: 'Imperial Stout', value: 'Imperial Stout' },
  { label: 'International-Style Pale Ale', value: 'International-Style Pale Ale' },
  { label: 'International-Style Pilsener', value: 'International-Style Pilsener' },
  { label: 'Irish Red Ale', value: 'Irish Red Ale' },
  { label: 'Irish-Style Red Ale', value: 'Irish-Style Red Ale' },
  { label: 'Kölsch', value: 'Kölsch' },
  { label: 'Leipzig-Style Gose', value: 'Leipzig-Style Gose' },
  { label: 'Light American Wheat Beer w/ Yeast', value: 'Light American Wheat Beer w/ Yeast' },
  {
    label: 'Light American Wheat Beer without Yeast',
    value: 'Light American Wheat Beer without Yeast'
  },
  { label: 'Lite American Lager', value: 'Lite American Lager' },
  { label: 'Mailbock/Helles Bock', value: 'Mailbock/Helles Bock' },
  { label: 'Metheglin', value: 'Metheglin' },
  { label: 'Mild', value: 'Mild' },
  { label: 'Mixed Culture Brett Beer', value: 'Mixed Culture Brett Beer' },
  { label: 'Munich Dunkel', value: 'Munich Dunkel' },
  { label: 'Munich Helles', value: 'Munich Helles' },
  { label: 'New England Cider', value: 'New England Cider' },
  { label: 'Northern English Brown Ale', value: 'Northern English Brown Ale' },
  { label: 'Northern German Altbier', value: 'Northern German Altbier' },
  { label: 'Oatmeal Stout', value: 'Oatmeal Stout' },
  { label: 'Oktoberfest/Märzen', value: 'Oktoberfest/Märzen' },
  { label: 'Old Ale', value: 'Old Ale' },
  { label: 'Open Category Mead', value: 'Open Category Mead' },
  { label: 'Ordinary Bitter', value: 'Ordinary Bitter' },
  { label: 'Other Belgian- and French-Style Ale', value: 'Other Belgian- and French-Style Ale' },
  { label: 'Other Belgian-Style Ale', value: 'Other Belgian-Style Ale' },
  { label: 'Other Belgian-Style Sour Ale', value: 'Other Belgian-Style Sour Ale' },
  {
    label: 'Other Belgian-Style Strong Specialty Ale',
    value: 'Other Belgian-Style Strong Specialty Ale'
  },
  { label: 'Other Fruit Melomel', value: 'Other Fruit Melomel' },
  { label: 'Other Smoke Beer', value: 'Other Smoke Beer' },
  { label: 'Other Smoked Beer', value: 'Other Smoked Beer' },
  { label: 'Other Specialty Cider/Perry', value: 'Other Specialty Cider/Perry' },
  { label: 'Other Strong Beer', value: 'Other Strong Beer' },
  { label: 'Pale American-Belgo-Style Ale', value: 'Pale American-Belgo-Style Ale' },
  { label: 'Peated Scotch Ale', value: 'Peated Scotch Ale' },
  { label: 'Premium American Lager', value: 'Premium American Lager' },
  { label: 'Pumpkin Beer', value: 'Pumpkin Beer' },
  { label: 'Pyment (Grape Melomel)', value: 'Pyment (Grape Melomel)' },
  { label: 'Robust Porter', value: 'Robust Porter' },
  { label: 'Roggenbier (German Rye Beer)', value: 'Roggenbier (German Rye Beer)' },
  { label: 'Rye Beer', value: 'Rye Beer' },
  { label: 'Saison', value: 'Saison' },
  { label: 'Schwarzbier (Black Beer)', value: 'Schwarzbier (Black Beer)' },
  { label: 'Scottish Export 80/-', value: 'Scottish Export 80/-' },
  { label: 'Scottish Heavy 70/-', value: 'Scottish Heavy 70/-' },
  { label: 'Scottish Light 60/-', value: 'Scottish Light 60/-' },
  { label: 'Scottish-Style Export Ale', value: 'Scottish-Style Export Ale' },
  { label: 'Scottish-Style Heavy Ale', value: 'Scottish-Style Heavy Ale' },
  { label: 'Scottish-Style Light Ale', value: 'Scottish-Style Light Ale' },
  { label: 'Semi-Sweet Mead', value: 'Semi-Sweet Mead' },
  { label: 'Session Beer', value: 'Session Beer' },
  { label: 'Session IPA', value: 'Session IPA' },
  { label: 'Smoke Porter', value: 'Smoke Porter' },
  {
    label: 'South German-Style Bernsteinfarbenes Weizen/Weissbier',
    value: 'South German-Style Bernsteinfarbenes Weizen/Weissbier'
  },
  { label: 'South German-Style Dunkel Weizen', value: 'South German-Style Dunkel Weizen' },
  { label: 'South German-Style Hefeweizen', value: 'South German-Style Hefeweizen' },
  { label: 'South German-Style Kristal Weizen', value: 'South German-Style Kristal Weizen' },
  { label: 'South German-Style Weizenbock', value: 'South German-Style Weizenbock' },
  { label: 'Southern English Brown Ale', value: 'Southern English Brown Ale' },
  { label: 'Special or Best Bitter', value: 'Special or Best Bitter' },
  { label: 'Special/Best/Premium Bitter', value: 'Special/Best/Premium Bitter' },
  { label: 'Specialty Beer', value: 'Specialty Beer' },
  { label: 'Spice, Herb, or Vegetable Beer', value: 'Spice, Herb, or Vegetable Beer' },
  { label: 'Standard American Lager', value: 'Standard American Lager' },
  { label: 'Standard/Ordinary Bitter', value: 'Standard/Ordinary Bitter' },
  { label: 'Straight (Unblended) Lambic', value: 'Straight (Unblended) Lambic' },
  { label: 'Strong Ale', value: 'Strong Ale' },
  { label: 'Strong Scotch Ale', value: 'Strong Scotch Ale' },
  { label: 'Sweet Mead', value: 'Sweet Mead' },
  { label: 'Sweet Stout', value: 'Sweet Stout' },
  { label: 'Sweet Stout or Cream Stout', value: 'Sweet Stout or Cream Stout' },
  { label: 'Traditional Bock', value: 'Traditional Bock' },
  { label: 'Traditional German-Style Bock', value: 'Traditional German-Style Bock' },
  { label: 'Traditional Perry', value: 'Traditional Perry' },
  { label: 'Traditional Scotch Ale', value: 'Traditional Scotch Ale' },
  { label: 'Unfiltered German-Style Ale', value: 'Unfiltered German-Style Ale' },
  { label: 'Unfiltered German-Style Lager', value: 'Unfiltered German-Style Lager' },
  { label: 'Vienna Lager', value: 'Vienna Lager' },
  { label: 'Vienna-Style Lager', value: 'Vienna-Style Lager' },
  { label: 'Weizen/Weissbier', value: 'Weizen/Weissbier' },
  { label: 'Weizenbock', value: 'Weizenbock' },
  { label: 'Wild Beer', value: 'Wild Beer' },
  { label: 'Witbier', value: 'Witbier' },
  { label: 'Wood Aged Beer', value: 'Wood Aged Beer' },
  { label: 'Wood- and Barrel-Aged Dark Beer', value: 'Wood- and Barrel-Aged Dark Beer' },
  {
    label: 'Wood- and Barrel-Aged Pale to Amber Beer',
    value: 'Wood- and Barrel-Aged Pale to Amber Beer'
  },
  { label: 'Wood- and Barrel-Aged Sour Beer', value: 'Wood- and Barrel-Aged Sour Beer' },
  { label: 'Wood- and Barrel-Aged Strong Beer', value: 'Wood- and Barrel-Aged Strong Beer' },
  { label: 'Wood- and Barrel-Aged Strong Stout', value: 'Wood- and Barrel-Aged Strong Stout' }
])

function batchChanged() {
  logDebug('BatchView.batchChanged()')

  if (batch.value == null) return false

  global.batchChanged = !Batch.compare(batch.value, batchSaved.value)
  return global.batchChanged
}

function isNew() {
  return router.currentRoute.value.params.id == 'new' ? true : false
}

function brewfatherChanged(id) {
  logDebug('BatchView.brewfatherChanged()', id)

  brewfatherStore.batches.forEach((b) => {
    if (id == b.brewfatherId) {
      batch.value.name = b.name
      batch.value.brewDate = b.brewDate
      batch.value.brewer = b.brewer
      batch.value.style = b.style
      batch.value.ebc = b.ebc
      batch.value.abv = b.abv
      batch.value.ibu = b.ibu
      batch.value.fermentationSteps = b.fermentationSteps
      return
    }
  })
}

onMounted(() => {
  logDebug('BatchView.onMounted()')

  batch.value = null

  brewfatherStore.getBatchList((success) => {
    logDebug('BatchView.onMounted()', success)

    brewfatherStore.batches.forEach((b) => {
      brewfatherOptions.value.push({
        label: b.name + ', ' + b.brewDate + ', ' + b.brewer + ', ' + b.style,
        value: b.brewfatherId
      })
    })

    updateDeviceOptions()

    if (isNew()) {
      batchSaved.value = new Batch()
      batch.value = new Batch()
    } else {
      batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
        if (success) {
          batchSaved.value = Batch.fromJson(b.toJson())
          batch.value = b
          // logDebug(batch.value)
        } else {
          global.messageError = 'Failed to load batch ' + router.currentRoute.value.params.id
        }
      })
    }
  })
})

function updateDeviceOptions() {
  logDebug('BatchView.updateDeviceOptions()')

  gravityDeviceOptions.value = []
  gravityDeviceOptions.value = [{ value: '', label: '-- Disabled --' }]
  pressureDeviceOptions.value = [{ value: '', label: '-- Disabled --' }]
  tempControlDeviceOptions.value = [{ value: 0, label: '-- Disabled --' }]

  deviceStore.devices.forEach((d) => {
    if (d.software == 'Gravitymon') {
      var sg =
        d.mdns != ''
          ? d.mdns
          : d.url != ''
            ? d.url
            : d.description != ''
              ? d.description
              : d.software

      gravityDeviceOptions.value.push({
        value: d.chipId,
        label: d.chipId + ' (' + sg + ')'
      })
    } else if (d.software == 'Pressuremon') {
      var sp =
        d.mdns != ''
          ? d.mdns
          : d.url != ''
            ? d.url
            : d.description != ''
              ? d.description
              : d.software

      pressureDeviceOptions.value.push({
        value: d.chipId,
        label: d.chipId + ' (' + sp + ')'
      })
    } else if (d.software == 'Chamber-Controller') {
      var sc = d.mdns != '' ? d.mdns : d.url != '' ? d.url : d.description

      if (d.url != '') {
        tempControlDeviceOptions.value.push({
          value: d.id,
          label: d.software + '(' + sc + ')'
        })
      }
    }
  })

  logDebug('BatchView.updateDeviceOptions()', 'Gravity', gravityDeviceOptions.value)
  logDebug('BatchView.updateDeviceOptions()', 'Pressure', pressureDeviceOptions.value)
  logDebug('BatchView.updateDeviceOptions()', 'Chamber', tempControlDeviceOptions.value)
}

const save = () => {
  logDebug('BatchView.save()')

  if (!validateCurrentForm()) return

  global.clearMessages()
  batchSaved.value = Batch.fromJson(batch.value.toJson())

  if (isNew()) {
    batchStore.addBatch(batch.value, (success, b) => {
      logDebug('BatchView.addBatch()', success)
      batch.value = b

      if (success) {
        logDebug('BatchView.addBatch()', 'Change to editor', success, batch.value)
        router.push({ name: 'batch', params: { id: batch.value.id } })
      } else {
        global.messageError = 'Failed to add batch'
      }
    })
  } else {
    batchStore.updateBatch(batch.value, (success) => {
      logDebug('BatchView.saveBatch()', success)
      if (success) global.messageSuccess = 'Saved batch'
      else global.messageError = 'Failed to save batch'
    })
  }
}
</script>
