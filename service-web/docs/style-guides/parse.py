import csv 
import requests 
import xml.etree.ElementTree as ET 

def loadRSS(): 

	# url of rss feed 
	url = 'http://www.hindustantimes.com/rss/topnews/rssfeed.xml'

	# creating HTTP response object from given url 
	resp = requests.get(url) 

	# saving the xml file 
	with open('topnewsfeed.xml', 'wb') as f: 
		f.write(resp.content) 
		

def parseXML(xmlfile): 
	tree = ET.parse(xmlfile) 
	root = tree.getroot() 

	styleItems = [] 

	for item in root.findall('./STYLE/NAME'): 
		styleItems.append(item.text) 
	
	return styleItems


def saveToJS(styleItems): 

	# Required format for dropdowns
	#
	# { label: 'American Amber Ale', value: 'American Amber Ale' },

	for style in styleItems:
		print( "{ label: '" + style + "', value: '" + style + "' }," )

	
def main(): 
	styleItems = parseXML('Brewfather_GABF_2015.xml') 
	styleItems += parseXML('Brewfather_BJCP_2008.xml') 
	styleItems = list(set(styleItems))
	styleItems.sort()
	saveToJS(styleItems)

	#savetoCSV(newsitems, 'topnews.csv') 
	
	
if __name__ == "__main__": 
	main() 
