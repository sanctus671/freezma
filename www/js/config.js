angular.module('app.config', [])
.constant('WORDPRESS_API_URL', 'http://www.taylorhamling.com/freezmafitness/api/')
.constant('WORDPRESS_API2_URL', 'http://www.taylorhamling.com/freezmafitness/wp-content/plugins/wcapiwrapper/index.php')
.constant('WORDPRESS_API3_URL', 'http://www.taylorhamling.com/freezmafitness/wp-content/plugins/messageapi/index.php')
.constant('WORDPRESS_API4_URL', 'http://www.taylorhamling.com/freezmafitness/wp-content/uploads/avatars/index.php')
.constant('WORDPRESS_PUSH_URL', 'http://www.taylorhamling.com/freezmafitness/push/')
.constant('GCM_SENDER_ID', '574597432927')
.constant('shopSettings',{
   
   
   payPalSandboxId : 'sand box id here',
   payPalProductionId : 'production id here',
   payPalEnv: 'PayPalEnvironmentSandbox',   // for testing  production for production
   payPalShopName : 'MyShopName',
   payPalMerchantPrivacyPolicyURL : 'url to policy',
   payPalMerchantUserAgreementURL : ' url to user agreement '
   
   
   
    
})
;


