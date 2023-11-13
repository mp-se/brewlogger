import unittest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.wait import WebDriverWait

class BrewLoggerTest(unittest.TestCase):

    def setUp(self):
        self.baseUrl = "http://localhost:8000"
        self.driver = webdriver.Chrome()

    def find_element(self, name):
        return self.driver.find_element(by=By.NAME, value=name)

    def test_01_device_list(self):
        self.driver.get(self.baseUrl + "/html/device/")     
        assert self.driver.current_url == self.baseUrl + "/html/device/"

    def test_02_add_device(self):
        self.driver.get(self.baseUrl + "/html/device/")     
        add = self.find_element("add-button")
        add.click()
        assert self.driver.current_url == self.baseUrl + "/html/device/0?func=create"

        chipId = self.find_element("chip_id-field")
        chipId.send_keys("123456")
        mdns = self.find_element("mdns-field")
        mdns.send_keys("123456.local")
        chipFamily = self.find_element("chip_family-field")
        chipFamilySelect = Select(chipFamily)
        chipFamilySelect.select_by_value("esp8266")
        chipFamilySelect.select_by_value("esp32")
        chipFamilySelect.select_by_value("esp32s2")
        chipFamilySelect.select_by_value("esp32s3")
        chipFamilySelect.select_by_value("esp32c3")
        chipFamilySelect.select_by_value("unknown")
        software = self.find_element("software-field")
        softwareSelect = Select(software)
        softwareSelect.select_by_value("Gravitymon")
        softwareSelect.select_by_value("Pressuremon")
        softwareSelect.select_by_value("Kegmon")
        softwareSelect.select_by_value("Brewpi")
        softwareSelect.select_by_value("iSpindel")
        softwareSelect.select_by_value("unknown")
        url = self.find_element("url-field")
        url.send_keys("http://localhost")
        bleColor = self.find_element("ble_color-field")
        bleColorSelect = Select(bleColor)
        bleColorSelect.select_by_value("")
        bleColorSelect.select_by_value("red")
        bleColorSelect.select_by_value("green")
        bleColorSelect.select_by_value("black")
        bleColorSelect.select_by_value("purple")
        bleColorSelect.select_by_value("orange")
        bleColorSelect.select_by_value("blue")
        bleColorSelect.select_by_value("yellow")
        bleColorSelect.select_by_value("pink")
        config = self.find_element("config-field")

        create = self.find_element("create-button")
        create.click()

        alert = self.find_element("alert")
        alertmsg = self.find_element("alert-msg")

        wait = WebDriverWait(self.driver, timeout=2)
        wait.until(lambda d : alert.get_dom_attribute("class").find("show") )      
        assert "alert-success" in alert.get_dom_attribute("class").split(' '), f"Failed to save record. {alertmsg.text}"

    def test_03_batch_list(self):
        self.driver.get(self.baseUrl + "/html/batch/")     
        assert self.driver.current_url == self.baseUrl + "/html/batch/"

    def test_04_add_batch(self):
        self.driver.get(self.baseUrl + "/html/batch/")     
        add = self.find_element("add-button")
        add.click()
        assert self.driver.current_url == self.baseUrl + "/html/batch/0?func=create"

        name = self.find_element("name-field")
        name.send_keys("Batch name")
        chipId = self.find_element("chip_id-field")
        chipIdSelect = Select(chipId)
        chipIdSelect.select_by_value("123456")
        description = self.find_element("description-field")
        description.send_keys("This is a description")
        brewDate = self.find_element("brew_date-field")
        brewDate.send_keys("2023-01-01")
        style = self.find_element("style-field")
        style.send_keys("IPA")
        brewer = self.find_element("brewer-field")
        brewer.send_keys("Anonymous")
        abv = self.find_element("abv-field")
        abv.clear()
        abv.send_keys("4.5")
        ebc = self.find_element("ebc-field")
        ebc.clear()
        ebc.send_keys("25")
        ibu = self.find_element("ibu-field")
        ibu.clear()
        ibu.send_keys("45")
        active = self.find_element("active-field")
        active.click()

        create = self.find_element("create-button")
        create.click()

        alert = self.find_element("alert")
        alertmsg = self.find_element("alert-msg")

        wait = WebDriverWait(self.driver, timeout=2)
        wait.until(lambda d : alert.get_dom_attribute("class").find("show") )      
        assert "alert-success" in alert.get_dom_attribute("class").split(' '), f"Failed to save record. {alertmsg.text}"

    def tearDown(self):
        self.driver.quit()

if __name__ == '__main__':
    unittest.main()