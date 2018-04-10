### CloudCats: Worker

The CloudCats worker process is responsible for scraping /r/aww using the JSON API, performing the image analysis with the Google Cloud Vision API, and then publishing the results into a Cloud PubSub topic. 
