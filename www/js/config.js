angular.module('app.config', [])
.constant('WORDPRESS_API_URL', 'http://www.freezmafitness.com/new/api/')
.constant('WORDPRESS_API2_URL', 'http://www.freezmafitness.com/new/wp-content/plugins/wcapiwrapper/index.php')
.constant('WORDPRESS_API3_URL', 'http://www.freezmafitness.com/new/wp-content/plugins/messageapi/index.php')
.constant('WORDPRESS_API4_URL', 'http://www.freezmafitness.com/new/wp-content/uploads/avatars/index.php')
.constant('WORDPRESS_PUSH_URL', 'http://www.freezmafitness.com/new/freezmafitness/push/')
.constant('GCM_SENDER_ID', '574597432927')
.constant('shopSettings',{
   
   
   payPalSandboxId : 'AQcyNKJrVWMe0kYazfLUEwQs4Z1NOBb9QwN8RLFbY07oxa9YzmqfBLe8OgNoIWaBuE1hiBK9k8slXi2b',
   payPalProductionId : 'AbTCp5C_a1Pu3yfv_Sxb2se4c_SnjF_tHqXFuLvZA_Kd-EZL1EHcv5MTnWwZ8nC48sPlWffvTJYziKOR',
   payPalEnv: 'PayPalEnvironmentProduction',   // 'PayPalEnvironmentSandbox' for testing  production for production
   payPalShopName : 'Freezma Fitness',
   payPalMerchantPrivacyPolicyURL : 'http://freezmafitness.com/index.php?page=contact',
   payPalMerchantUserAgreementURL : ' http://freezmafitness.com/index.php?page=contact'
   
   
   
    
})
;


