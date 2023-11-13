import unittest, requests

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.wait import WebDriverWait

url = "http://localhost:8000"
api_key = "akljnv13bvi2vfo0b0bw789jlljsdf"
headers = {
    "Authorization": "Bearer " + api_key,
    "Content-Type": "application/json",
}

class TestBase(unittest.TestCase):
    def setUp(self):
        self.baseUrl = url
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, timeout=2)

    def tearDown(self):
        self.driver.quit()

    def find_element(self, name):
        return self.driver.find_element(by=By.NAME, value=name)

    def wait_for_alert(self):
        alert = self.find_element("alert")
        alertmsg = self.find_element("alert-msg")
        self.wait.until(lambda d : alert.get_dom_attribute("class").find("show") )      
        assert "alert-success" in alert.get_dom_attribute("class").split(' '), f"Failed to save record. {alertmsg.text}"

    def set_textfield(self, field, value):
        f = self.find_element(field)
        f.clear()
        f.send_keys(value)

    def set_selectfield(self, field, array):
        f = Select(self.find_element(field))
        for a in array:
            f.select_by_value(a)

class BrewLoggerTest(TestBase):

    def test_01_device_list(self):
        self.driver.get(self.baseUrl + "/html/device/")     
        assert self.driver.current_url == self.baseUrl + "/html/device/"

    def test_02_add_device(self):
        self.driver.get(self.baseUrl + "/html/device/")     
        self.find_element("add-button").click()
        assert self.driver.current_url == self.baseUrl + "/html/device/0?func=create"

        self.set_textfield("chip_id-field", "123456")
        self.set_textfield("mdns-field", "123456.local")
        self.set_selectfield("chip_family-field", ["","esp8266","esp32","esp32s2","esp32s3","esp32c3"])
        self.set_selectfield("software-field", ["","Gravitymon","Pressuremon","Kegmon","Brewpi","iSpindel"])
        self.set_textfield("url-field", "http://localhost")
        self.set_selectfield("ble_color-field", ["","red","green","black","purple","orange","blue","yellow","pink"])
        self.find_element("config-field")
        self.find_element("create-button").click()

        self.wait_for_alert()

        self.wait.until(lambda d : self.driver.current_url.endswith("?func=edit") )      
        id = self.driver.current_url[self.driver.current_url.rfind('/')+1:self.driver.current_url.find('?')]
        assert self.driver.current_url == self.baseUrl + "/html/device/" + id + "?func=edit"

        print(f"Added device record with id {id}")

    def test_03_batch_list(self):
        self.driver.get(self.baseUrl + "/html/batch/")     
        assert self.driver.current_url == self.baseUrl + "/html/batch/"

    def test_04_add_batch(self):
        self.driver.get(self.baseUrl + "/html/batch/")     
        add = self.find_element("add-button")
        add.click()
        assert self.driver.current_url == self.baseUrl + "/html/batch/0?func=create"

        self.set_textfield("name-field","Batch name")
        self.set_selectfield("chip_id-field", ["123456"])
        self.set_textfield("description-field", "This is a description")
        self.set_textfield("brew_date-field", "2023-01-01")
        self.set_textfield("style-field", "IPA")
        self.set_textfield("brewer-field", "Anonymous")
        self.set_textfield("abv-field", "4.5")
        self.set_textfield("ebc-field", "25")
        self.set_textfield("ibu-field", "45")
        self.find_element("active-field").click()
        self.find_element("create-button").click()

        self.wait_for_alert()

        self.wait.until(lambda d : self.driver.current_url.endswith("?func=edit") )      
        id = self.driver.current_url[self.driver.current_url.rfind('/')+1:self.driver.current_url.find('?')]
        assert self.driver.current_url == self.baseUrl + "/html/batch/" + id + "?func=edit"

        print(f"Added batch record with id {id}")

if __name__ == '__main__':
    r = requests.delete(url + "/html/test/cleardb", headers=headers)
    assert r.status_code == 204
    unittest.main()
