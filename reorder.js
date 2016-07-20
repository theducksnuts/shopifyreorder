/* Created by David Martin.
 * Copyright (C) 2016 David Martin. All Rights Reserved.
 * MEKU APPS | https://meku.co 
 * Shopify 'Customer Re-Order' App | https://apps.shopify.com/reorder
 */
var reorderFunctionEnable;
var reorderFunctionShowSummary;
var reorderFunctionClosePopup;
var reorderFunctionCheckoutOrder;
var reorderFunctionCheckoutAccount;

(function(){
    reorderFunctionEnable = function ReorderEnable(){
        // Activate Links on Account Page when file is loaded.
        var activate_acclinks = document.getElementsByClassName("reorder-account-link");
        if (activate_acclinks.length > 0){
            for(var i=0; i<activate_acclinks.length; i++){
                activate_acclinks[i].setAttribute("style", "display: inherit;");
            }
        }
        var activate_orderlink = document.getElementsByClassName("reorder-wrap");
        if(activate_orderlink.length == 1){
            activate_orderlink[0].setAttribute("style", "display:block;");
        }
    }
    
    function isIE () {
      var myNav = navigator.userAgent.toLowerCase();
      return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
    
    reorderFunctionShowSummary = function ReorderShowSummary(orderid){
        try {
            //Get Requested Order Details
            var thisorder = document.getElementById("reacc_"+orderid);
            var order_products;
            var order_totalprice;
            var order_url;
            var order_no;
            var reorder_data;
            //Check if < IE9, otherwise do normal: 
            if (isIE () && isIE () <= 9) {
             // is IE version less than 9
                order_products = thisorder.getAttribute('data-products');
                order_totalprice = thisorder.getAttribute('data-totalprice');
                order_url = thisorder.getAttribute('data-orderurl');
                order_no = thisorder.getAttribute('data-orderno');
                reorder_data = thisorder.getAttribute('data-reorder');
            } else {
                order_products = thisorder.dataset.products;
                order_totalprice = thisorder.dataset.totalprice;
                order_url = thisorder.dataset.orderurl;
                order_no = thisorder.dataset.orderno;
                reorder_data = thisorder.dataset.reorder;
            }
            var raw_reorder_data = reorder_data;
            reorder_data = "'"+reorder_data+"'";
            
            //Update ReOrder Button in Summary
            var reorder_button = document.getElementById("reorder_button");
            var button_reclass;
            var button_retext;
            if (isIE () && isIE () <= 9) {
             // is IE version less than 9
                button_reclass = reorder_button.getAttribute('data-reclass');
                button_retext = reorder_button.getAttribute('data-retext');
            }else{
                button_reclass = reorder_button.dataset.reclass;
                button_retext = reorder_button.dataset.retext;
            }
            
            var check_unavailable = (reorder_data.match(/unavailable/g)||[]).length
            
            if(check_unavailable > 0){
                reorder_button.innerHTML = '<button id="re_popup_reorder" class="'+button_reclass+' reorder-button-account" disabled><span class="reorder_mobileshow">Unavailable</span><span class="reorder_mobilehide">Re-Order is Unavailable</span></button>';
            }else{
                reorder_button.innerHTML = '<button id="re_popup_reorder" class="'+button_reclass+' reorder-button-account" onclick="reorderFunctionCheckoutAccount('+reorder_data+');" ><span class="reorder_mobileshow">Re-Order</span><span class="reorder_mobilehide">'+button_retext+'</span></button>';
            }
            
            
            
            //Load Order URL
            var reorder_orderurl = document.getElementById("re_popup_viewdetails");
            reorder_orderurl.innerHTML = "<a id='re_popup_moredetails' href='"+order_url+"'>View Order <span class='reorder_mobilehide'> Details</span></a>";
            
            //Filter Products for JSON
            var products_fix;
            
            //Remove First Product Title
            var product_title_0 = order_products.match(/^.*?(?=', ')/g);
            var order_title_0_length = product_title_0.toString().length;
            var order_products_rest = order_products.toString().substring(order_title_0_length);
            
            //Count other proudct by matching '],[' for total product number
            
            var products_count;
            
            if(order_products.match(/('\],\[')/g) == null){
                products_count = 1;
            }else{
                products_count = order_products.match(/('\],\[')/g).length + 1;
            }
            
            //for loop formatting each bit
            var to_save;
            var product_title;
            var product_title_length;
            var product_rest;
            var product_rest_length;
            //
            for(var iii=0; iii<products_count; iii++){
                if(iii == 0){
                    //For First One
                    if(products_count == 1){
                        product_title_0 = product_title_0.toString().substring(3);
                        product_title_0 = product_title_0.toString().replace(/[^\w\s]/g, "");
                        to_save = "[['" + product_title_0 + order_products_rest;
                        products_fix = to_save;
                    }else{
                        product_title_0 = product_title_0.toString().substring(3);
                        product_title_0 = product_title_0.toString().replace(/[^\w\s]/g, "");
                        var product_0_rest = order_products_rest.match(/^.*?(\],\[')/g);
                        var product_0_rest_count = product_0_rest.toString().length;
                        order_products_rest = order_products_rest.substring(product_0_rest_count);
                        to_save = "[['" + product_title_0 + product_0_rest;
                        products_fix = to_save;
                    }
                }else if(iii == (products_count - 1)){
                    //For the Last
                    product_title = order_products_rest.match(/^.*?(?=', ')/g);
                    product_title_length = product_title.toString().length;
                    order_products_rest = order_products_rest.substring(product_title_length);
                    product_title = product_title.toString().replace(/[^\w\s]/g, "");
                    to_save = product_title + order_products_rest;
                    products_fix = products_fix + to_save;
                }else{
                    //For the Rest
                    product_title = order_products_rest.match(/^.*?(?=', ')/g);
                    product_title_length = product_title.toString().length;
                    order_products_rest = order_products_rest.substring(product_title_length);
                    product_title = product_title.toString().replace(/[^\w\s]/g, "");
                    product_rest = order_products_rest.match(/^.*?(\],\[')/g);
                    product_rest_length = product_rest.toString().length;
                    order_products_rest = order_products_rest.substring(product_rest_length);
                    to_save = product_title + product_rest;
                    products_fix = products_fix + to_save;
                }
            }
            order_products = products_fix;
                
            //Load Products
            var reorder_products = document.getElementById("re_insert_products");
            order_products = order_products.split("'").join('"');
            order_products = JSON.parse(order_products);
            //Check if Json objects parsed through properly
            if(order_products.length > 0){
                var product_li = "<ul class='re_popup_productlist'>";
                var avail_check = raw_reorder_data.split(",");
                for(var i=0; i<order_products.length; i++){
                    var product_title = order_products[i][0];
                    var max_length = 25;
                    var threshold = max_length + 4;
                    if(product_title.length >= threshold){
                        product_title = product_title.substring(0, max_length) + "...";
                    }
                    //ADD IN THE A LINK TO REPLACE TEH EM FOR EACH PRODUCT (_BLANK)
                    var add_to_li;
                    if(avail_check[i] == "unavailable"){
                        add_to_li = "<li class='re_popup_checkli'><strong>Sorry!</strong> Item is no longer Available <strong> @ "+order_products[i][2]+"</strong></li>";
                    }else{
                        add_to_li = "<li class='re_popup_checkli'><div class='reorder_mobilehide_sml' style='background: url("+order_products[i][3]+") left center no-repeat; background-size: cover; vertical-align:middle; width: 30px; height: 30px; display: inline-block;border: solid 1px currentColor;margin-right:10px !important;'></div><strong>"+order_products[i][1]+" x </strong><a href='"+order_products[i][4]+"' target='_blank'><strong>'"+product_title+"'</strong></a> <strong>&nbsp&nbsp"+order_products[i][2]+"</strong></li>";
                    }
                    product_li = product_li + add_to_li;
                }
                product_li = product_li + "</ul>";
                reorder_products.innerHTML = product_li;
                
                //Load Pricing
                var reorder_pricing = document.getElementById("re_insert_totalprice");
                reorder_pricing.innerHTML = "<a href='"+order_url+"'>"+order_totalprice+"</a>";
                
                //Load Order Number
                var reorder_orderno = document.getElementById("re_insert_orderno");
                reorder_orderno.innerHTML = "<a href='"+order_url+"'>"+order_no+"</a>";
                
                //Show Popup
                $(function(){
                  $('#reorder_popup').fadeIn('fast');
                });
                
                //Check if LI content has overflown and if so - reduce the font size until it fits
                var get_all_lis = document.getElementsByClassName("re_popup_checkli");
                var element;
                var adjusted_font;
                var original_font;
                for(var ii=0; ii<get_all_lis.length; ii++){
                    //Run through check 3 times (reducing by 1 size if is overflowed).
                    element = get_all_lis[ii];
                    if ((element.offsetHeight + 3) < element.scrollHeight || element.offsetWidth < element.scrollWidth) {
                        // Reduce Font Size & Check Again
                        original_font = window.getComputedStyle(get_all_lis[ii], null).getPropertyValue('font-size');
                        original_font = parseFloat(original_font);
                        adjusted_font = original_font - 1;
                        get_all_lis[ii].setAttribute("style", "font-size:" + adjusted_font + "px !important;");
                    } 
                    if ((element.offsetHeight + 3) < element.scrollHeight || element.offsetWidth < element.scrollWidth) {
                        // Reduce Font Size & Check Again
                        original_font = window.getComputedStyle(get_all_lis[ii], null).getPropertyValue('font-size');
                        original_font = parseFloat(original_font);
                        adjusted_font = original_font - 1;
                        get_all_lis[ii].setAttribute("style", "font-size:" + adjusted_font + "px !important;");
                    } 
                    if ((element.offsetHeight + 3) < element.scrollHeight || element.offsetWidth < element.scrollWidth) {
                        // Reduce Font Size & Check Again
                        original_font = window.getComputedStyle(get_all_lis[ii], null).getPropertyValue('font-size');
                        original_font = parseFloat(original_font);
                        adjusted_font = original_font - 1;
                        get_all_lis[ii].setAttribute("style", "font-size:" + adjusted_font + "px !important;");
                    } 
                    if ((element.offsetHeight + 3) < element.scrollHeight || element.offsetWidth < element.scrollWidth) {
                        // If element is still to big - set overflow to hidden
                        get_all_lis[ii].setAttribute("style", "font-size:" + adjusted_font + "px !important;"+"overflow:hidden;");
                    }
                }
                
                //Double Check that it's visible after 0.5 secs
                setTimeout(function(){
                var reorder_popup = document.getElementById("reorder_popup");
                var check_block = reorder_popup.style.display;
                    if(check_block != "block"){
                        reorder_popup.setAttribute("style", "display: block;");
                    }
                }, 500);
            }
        }catch(err) {
            // alert("reorderFunctionShowSummary ::: " + err.message);
        }
    }

    reorderFunctionClosePopup = function ReorderClosePopup(){
        try{
            //Hide Popup
            $(function(){
              $('#reorder_popup').fadeOut('fast');
            });
             //Double Check jQuery worked and that it's NOT visible after 0.5 secs
            setTimeout(function(){
            var reorder_popup = document.getElementById("reorder_popup");
            var check_none = reorder_popup.style.display;
                if(check_none != "none"){
                    reorder_popup.setAttribute("style", "display: none;");
                }
            }, 500);
        }catch(err) {
            // alert("reorderFunctionClosePopup ::: " + err.message);
        }
    }
    reorderFunctionCheckoutOrder = function reorderCheckout(e) {
        try{
            var t = document.getElementById("reorder-checkout") || !1;
            if (t) {
                t.setAttribute("disabled", "disabled"), t.innerHTML = "Checking Out...";
                var n = document.domain,
                    o = "https://" + n + "/cart/",
                    c = e,
                    d = o.concat(c);
                    d = d + "?ref=reorder-sale-ord";
                window.location.assign(d);
            }
        }catch(err) {
            // alert("reorderFunctionCheckoutOrder ::: " + err.message);
        }
    }
    reorderFunctionCheckoutAccount = function reorderCheckoutAcc(e) {
        try{
            var t = document.getElementById("re_popup_reorder") || !1;
            if (t) {
                t.setAttribute("disabled", "disabled"), t.innerHTML = "Checking Out...";
                var n = document.domain,
                    o = "https://" + n + "/cart/",
                    c = e,
                    d = o.concat(c);
                    d = d + "?ref=reorder-sale-acc";
                window.location.assign(d);
            }
        }catch(err) {
            // alert("reorderFunctionCheckoutAccount ::: " + err.message);
        }
    }
    
})();
reorderFunctionEnable();
