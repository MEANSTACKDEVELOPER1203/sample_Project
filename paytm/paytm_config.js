module.exports = {

  // Staging
  paytm_config: {
		MID: 'IENTER35085996277002', // Prod 'IENTER56499813066149' // Demo 'IENTER35085996277002'
		WEBSITE: 'APPSTAGING', // prod 'APPPROD' //demo 'APPSTAGING'
    CHANNEL_ID: 'WAP',
    INDUSTRY_TYPE_ID: 'Retail', // prod 'Retail109' // Demo 'Retail'
    MERCHANT_KEY : 'RD0tZU3R5gKYLjv&', // Prod 'Plrmc7QPQoR8oC8#', // Staging 'kcDm6Jkn8KR%BJ3e'
    MOBILE_NUMBER : '8186948581',
    EMAIL: 'accounts@celebkonect.com',
    TXN_URL : 'https://securegw-stage.paytm.in/merchant-status/getTxnStatus?JsonData='  // Prod 'https://securegw.paytm.in/merchant-status/getTxnStatus?JsonData='  , // Staging 'https://securegw-stage.paytm.in/merchant-status/getTxnStatus?JsonData='
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
	// }
}