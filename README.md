# WordPress plugin eLead Lightbox

Plugin developed by [John Farrell MacDonald](https://jfmacdonald.com) for [RC Energy Solutions](https://rcenergysolutions.com),
a client of [DataLink SEO](http://datalinkseo.com).

The plugin provides forms for a person interested in RC Energy services to provide information, which is sent to 
an [ImproveIt360](https://www.improveit360.com/) customer relationship management (CRM) system based on the Salesforce
[Force.com](https://www.salesforce.com/products/platform/products/force/) platform.

- Base form.
- A call-to-action button with an embedded form for zip code that brings up the base form in a modal (lightbox)
- A call-to-action button with an embedded form for daily average kWh that calculates solar system size and brings
  up a form in a modal
  
The first two items are in play on the RC Energy home page, https://rcenergysolutions.com. The later, on a services page,
https://rcenergysolutions.com/solar-panels-san-diego/, sends an email to the customer and the information to the CRM.

## Short codes

Shortcodes entered in a text field (such as [elead-lightbox-form]) are replaced with HTML in rendered page when the plugin is activated.

<dl>
<dt> elead-lightbox-form </dt>
<dd> Embed code for form.</dd>
<dt> elead-lightbox-cta </dt>
<dd> Embed call-to-action button with zip code input. Activation opens form in modal. Submission sends info to CRM. </dd>
<dt> elead-lightbox-instant-quote </dt>
<dd> Embed call-to-action with input for customer's average daily kWh. Activation calculates solar system size and 
    opens form in a modal. Form submission sends info to CRM and email to customer with their instant quote. </dd>
</dl>


## Installation

```bash

$ cd <wordpress-install-dir>/wp-content/plugins
$ git clone git@bitbucket.org:jfmacdonald/elead-lightbox.git && cd elead-lightbox
$ npm install
$ bower install
$ gulp

Activate plugin and insert shortcodes where needed. 

```

