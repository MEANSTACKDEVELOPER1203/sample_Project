var config = require('.././config/config')
module.exports = {

  // Staging
  paytm_config: {
		MID: 'JLOTGY48867147844550', // Prod 'IENTER56499813066149' // Demo 'IENTER35085996277002'
		WEBSITE: 'APPSTAGING', // prod 'APPPROD' //demo 'APPSTAGING'
    CHANNEL_ID: 'WAP',
    INDUSTRY_TYPE_ID: 'Retail', // prod 'Retail109' // Demo 'Retail'
    MERCHANT_KEY : 'wVuh9EcsTiPKNSjI', // Prod 'Plrmc7QPQoR8oC8#', // Staging 'wVuh9EcsTiPKNSjI'
    MOBILE_NUMBER : '8186948581',
    EMAIL: 'accounts@celebkonect.com',
    TXN_URL : 'https://securegw-stage.paytm.in/merchant-status/getTxnStatus?JsonData=', // Prod 'https://securegw.paytm.in/merchant-status/getTxnStatus?JsonData='  , // Staging 'https://securegw-stage.paytm.in/merchant-status/getTxnStatus?JsonData='
  },
///paytm_config_web ///// for test(stagging)
  paytm_config_web: {
		MID: 'JLOTGY48867147844550', // Prod 'IENTER56499813066149' // Demo 'IENTER35085996277002'
		WEBSITE: 'WEBSTAGING', // prod 'DEFAULT' //demo 'WEBSTAGING'
    CHANNEL_ID: 'WEB',
    INDUSTRY_TYPE_ID: 'Retail', // prod 'Retail109' // Demo 'Retail'
    MERCHANT_KEY : 'wVuh9EcsTiPKNSjI', // Prod 'Plrmc7QPQoR8oC8#', // Staging 'kcDm6Jkn8KR%BJ3e'
    MOBILE_NUMBER : '8186948581',
    EMAIL: 'accounts@celebkonect.com',
    CALLBACK_URL:config.baseUrl+".celebkonect.com:4300/payments/paywithpaytmresponse",
    PAYTM_FINAL_URL:'https://securegw-stage.paytm.in/order/process',  ///stagging 'https://securegw-stage.paytm.in/order/process' ////prod  'https://securegw.paytm.in/order/process'
  }
  
  
  // Production

  // paytm_config: {
	// 	MID: 'IENTER56499813066149', // Prod 'IENTER56499813066149' // Demo 'IENTER06579977505143'
	// 	WEBSITE: 'APPPROD', // prod 'APPPROD' //demo 'APPSTAGING'
  //   CHANNEL_ID: 'WAP',
  //   INDUSTRY_TYPE_ID: 'Retail109', // prod 'Retail109' // Demo 'Retail'
  //   MERCHANT_KEY : 'Plrmc7QPQoR8oC8#', // Prod 'Plrmc7QPQoR8oC8#', // Staging 'kcDm6Jkn8KR%BJ3e'
  //   MOBILE_NUMBER : '8186948581',
  //   EMAIL: 'accounts@celebkonect.com',
  //   TXN_URL : 'https://securegw.paytm.in/merchant-status/getTxnStatus?JsonData='  // Prod 'https://securegw.paytm.in/merchant-status/getTxnStatus?JsonData='  , // Staging 'https://securegw-stage.paytm.in/merchant-status/getTxnStatus?JsonData='
  // },
  // ///paytm_config_web ///// for test(prod)
  // paytm_config_web: {
	// 	MID: 'IENTER56499813066149', // Prod 'IENTER56499813066149' // Demo 'IENTER35085996277002'
	// 	WEBSITE: 'DEFAULT', // prod 'DEFAULT' //demo 'WEBSTAGING'
  //   CHANNEL_ID: 'WEB',
  //   INDUSTRY_TYPE_ID: 'Retail109', // prod 'Retail109' // Demo 'Retail'
  //   MERCHANT_KEY : 'Plrmc7QPQoR8oC8#', // Prod 'Plrmc7QPQoR8oC8#', // Staging 'kcDm6Jkn8KR%BJ3e'
  //   MOBILE_NUMBER : '8186948581',
  //   EMAIL: 'accounts@celebkonect.com',
  //   PAYTM_FINAL_URL:'https://securegw.paytm.in/order/process',  ///stagging 'https://securegw-stage.paytm.in/order/process' ////prod  'https://securegw.paytm.in/order/process'
  // }
  
  
}