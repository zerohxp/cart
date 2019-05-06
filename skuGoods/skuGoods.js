var goodService = require('../../service/goods/goodService');
var cartService = require('../../service/cart/cartService');
var purchaseService = require('../../service/purchase/purchaseService');
var App = getApp();
Component({
  properties: {
    _event:{
      type: String,
      value: ''
    },
    cart_id: {
      type: String,
      value: ''
    },
    seckill_id: {
      type: String,
      value: ''
    }, 
    seckill_price: {
      type: String,
      value: ''
    },
    bargain_id: {
      type: String,
      value: ''
    },
    set_type: {//调用的方式：默认为加入购物车，buyNow为立即购买
      type: String,
      value: ''
    },
    fightgroup: {
      type: String,
      value: ''
    },
    fightgroup_launch_id:{
      type: String,
      value: ''
    },
    discountObj:{
      type:Object,
      value:''
    },
    seckill_cquota:{
      type: Number,
      value: 0
    },
    live_id:{
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    skuModal: false,
    goodsSku: {},
    isSubmit: false,
    imgBaseURL: App.globalData.imgBaseURL,
    sourceURL: App.globalData.sourceURL,
    activity:false,
    button:false
  },
  currentGoodsId: '',
  isSubmiting:false,
  /**
   * 组件的方法列表
   */
  methods: {
    getGoodSku: function (goodId, params, button,activity) {
    var that = this;
    App.globalData.authorizePageShow = false;
    that.currentGoodsId = goodId;
    var seckill_id = that.properties.seckill_id;
    var seckill_price = that.properties.seckill_price; 
    var discountObj = that.properties.discountObj; 
    
    wx.showLoading({
      title: '加载中'
    });
    goodService.skuData(goodId, params, function (response) {
      if (response) {
        var goodsSku = response.data;
        goodsSku.selectedQuantity = 1;
        goodsSku.selectedProps = {};
        goodsSku.disabledProps = {};
        goodsSku.abledProps = {};
        var disabledSpec = [];
        var abledSpec = [];
         var discount = goodsSku.discount;
         if(discount){
           var price = goodsSku.price;
            price = Number(price) * Number(discount) * 0.1;
            price = (Math.round(price * 100) / 100).toFixed(2);
            goodsSku.vipPrice = price;
           if(goodsSku.is_sku == 1 || goodsSku.is_sku == 2){
              var max_price = goodsSku.max_price;
              if(max_price && max_price !="0.00"){
                 max_price = Number(max_price) * Number(discount) * 0.1;
                 max_price = (Math.round(max_price * 100) / 100).toFixed(2);
                 goodsSku.vipMaxPrice = max_price;
              }else{
                 goodsSku.vipMaxPrice ="0.00";
              }
           }
         }
        if (goodsSku.is_sku == 1) {
          goodsSku.btnDisabled = true;
          var goods_spec = goodsSku.goods_spec;
          for (var spec in goods_spec) {
            var _stock = goods_spec[spec].stock;
            if (_stock == 0) {
              goodsSku.disabledProps[spec] = true;
              disabledSpec.push(spec);
            }else{
              abledSpec.push(spec)
            }
            
          }
        }else if(goodsSku.is_sku == 2){
          goodsSku.btnDisabled = true;
        }
        goodsSku.disabledSpec = disabledSpec;
        goodsSku.abledSpec = abledSpec;
        wx.hideLoading();
        var hideQuality = false;
        if(activity){
          hideQuality = true;
        }else{
          activity='';
        }
        if (button =='undefined'){
          button=false
        }
        if (seckill_id) {
          goodsSku.type = "seckill";
          goodsSku.seckillPrice = seckill_price;
        }
        else if (discountObj && discountObj.length > 0) {
          goodsSku.type = "discount";
        }
        that.isSubmiting = false;
        that.setData({ goodsSku: goodsSku, skuModal: true, button:button,activity:activity,hideQuality:hideQuality })
      }
    })
  },
    editQuantity: function (e) {
      var that = this;
      var currentTarget = e.currentTarget;
      var option = '';
      if (currentTarget) {
        option = currentTarget.dataset.option;
      }
      var goodsSku = that.data.goodsSku;
      var selectedQuantity = goodsSku.selectedQuantity;
      var stock = goodsSku.stock;
      if (goodsSku.currentGoods) {
        stock = goodsSku.currentGoods.stock;
      }

      if (option == "minus") {
        if (selectedQuantity == 1) {
          wx.showToast({
            title: '至少选择一个',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        selectedQuantity--;
      } else if (option == "plus") {
        if (selectedQuantity == stock) {
          wx.showToast({
            title: '库存不足',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        selectedQuantity++;
      }
      //判断是否超出秒杀限制数量
      var cquota = that.properties.seckill_cquota;
      if (cquota > 0) {
        if (stock > cquota) {
          if (selectedQuantity > cquota) {
            wx.showToast({
              title: '购买数量已达上线',
              icon: 'none',
              duration: 2000
            });
            selectedQuantity = cquota;
          }
        }
      }
      goodsSku.selectedQuantity = selectedQuantity;
      that.setData({ goodsSku: goodsSku })
    },
    inputQuantity: function (event) {
      var that = this;
      var value = event.detail.value;
      var goodsSku = that.data.goodsSku;
      value = value.replace(/^[0]+/, '');
      var stock = goodsSku.stock;
      if (goodsSku.currentGoods) {
        stock = goodsSku.currentGoods.stock;
      }
      if (value > stock) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 2000
        });
        value = stock;
      }
       //判断是否超出秒杀限制数量
      var cquota = that.properties.seckill_cquota;
      if (cquota > 0) {
        if(stock > cquota){
          if (value > cquota) {
            wx.showToast({
              title: '购买数量已达上线',
              icon: 'none',
              duration: 2000
            });
            value = cquota;
          }
        }
      }
      goodsSku.selectedQuantity = value;
      that.setData({ goodsSku: goodsSku });
    },
    selectProps: function (e) {
      var that = this;
      var currentTarget = e.currentTarget;
      var propId = '';
      var propValueId = "";
      var goodsSku = that.data.goodsSku;
      if (currentTarget) {
        propId = currentTarget.dataset.propId;
        propValueId = currentTarget.dataset.propValueId;
        var selectedProps = goodsSku.selectedProps;
        if (!selectedProps) selectedProps = {};
        selectedProps[propId] = propValueId;
        // goodsSku.selectedProps = selectedProps;
        var disabledSpec = goodsSku.disabledSpec;
        var abledSpec = goodsSku.abledSpec;
        var key = propId + ":" + propValueId;
        var disabledProps = {};
        var len = Object.getOwnPropertyNames(selectedProps).length
        if (len != Object.getOwnPropertyNames(goodsSku.goods_props).length){
        for (var i = 0; i < disabledSpec.length; i++) {
          var _disabledSpec = disabledSpec[i]
          var _len = 1;
          for (var pK in selectedProps){
            var _k = pK + ':' + selectedProps[pK]
            if (_disabledSpec.indexOf(_k) != -1) {
              if (_disabledSpec.indexOf(_k + ";") != -1) {
                _disabledSpec = _disabledSpec.replace(_k + ";", "");
                if(len == _len){
                  var _array = _disabledSpec.split(";");
                  for (var j = 0; j < _array.length; j++) {
                    disabledProps[_array[j]] = true;
                  }
                }
              } else if (_disabledSpec.indexOf(";" + _k) != -1){
                _disabledSpec = _disabledSpec.replace(";" + _k, "");
                if (len == _len) {
                  var _array = _disabledSpec.split(";");
                  for (var j = 0; j < _array.length; j++) {
                    disabledProps[_array[j]] = true;
                  }
                }
              }else{
                disabledProps[key] = true;
              }
              _len++;
            }
           
          }
          
        }
       for (var i = 0; i < abledSpec.length; i++) {
          var _abledSpec = abledSpec[i]
          var _len = 1;
          for (var pK in selectedProps) {
            var _k = pK + ':' + selectedProps[pK]
            if (_abledSpec.indexOf(_k) != -1) {
              if (_abledSpec.indexOf(_k + ";") != -1) {
                _abledSpec = _abledSpec.replace(_k + ";", "");
                if (len == _len) {
                  var _array = _abledSpec.split(";");
                  for (var j = 0; j < _array.length; j++) {
                    disabledProps[_array[j]] = false;
                  }
                }
              } else if (_abledSpec.indexOf(";" + _k) != -1) {
                _abledSpec = _abledSpec.replace(";" + _k, "");
                if (len == _len) {
                  var _array = _abledSpec.split(";");
                  for (var j = 0; j < _array.length; j++) {
                    disabledProps[_array[j]] = false;
                  }
                }
              } else {
                disabledProps[key] = false;
              }
              _len++;
            } 
          }
        }
        }
        if (len == Object.getOwnPropertyNames(goodsSku.goods_props).length){ 
          var goods_props_array = goodsSku.goods_props;
          var goods_props_item = goods_props_array[propId]
          var goods_props_item_gps =  goods_props_item.gps
          for (var gps_i in goods_props_item_gps) {
            var goods_prop_vid = goods_props_item_gps[gps_i].prop_vid;
            selectedProps[propId] = goods_prop_vid;
            var goods_props_item_span = ""
            for (var key in selectedProps) {
              if (goods_props_item_span) {
                goods_props_item_span += ";" + key + ":" + selectedProps[key];
              } else {
                goods_props_item_span = key + ":" + selectedProps[key];
              }
            }
            var _key2 = propId + ':' + goods_prop_vid
            disabledProps[_key2] = false
            for (var i = 0; i < disabledSpec.length; i++) {
              if (goods_props_item_span == disabledSpec[i]){
                disabledProps[_key2] = true
              }
            }

          }
        }
        selectedProps[propId] = propValueId;
        goodsSku.selectedProps = selectedProps;
        goodsSku.disabledProps = disabledProps;
        var goods_props = goodsSku.goods_props;
        var _spec_key = "";
        for (var key in goods_props) {
          if (selectedProps[key]) {
            if (_spec_key) {
              _spec_key += ";" + key + ":" + selectedProps[key];
            } else {
              _spec_key = key + ":" + selectedProps[key];
            }
          } else {
            that.setData({ goodsSku: goodsSku });
            return;
          }
        }
        var goods_spec = goodsSku.goods_spec;
        if (goods_spec[_spec_key]) {
          goodsSku.currentGoods = goods_spec[_spec_key];
          goodsSku.selectedQuantity = 1;
          if (goodsSku.currentGoods.stock == 0) {
            goodsSku.btnDisabled = true;
          } else {
            goodsSku.btnDisabled = false;
          }
          var discount = goodsSku.discount;
          if (discount) {
            var price = goodsSku.currentGoods.price;
            price = Number(price) * Number(discount) * 0.1;
            price = (Math.ceil(price * 100) / 100).toFixed(2);
            goodsSku.currentGoods.vipPrice = price;
          }
        } else {
          wx.showToast({
            title: '选择规格不正确',
            icon: 'none',
            duration: 2000
          });
        }
        that.setData({ goodsSku: goodsSku });
      }
    },
    _gotoconfirm: function (e) {
      var that = this;
      App.pageFunInit(() => {
      var goodsSku = that.data.goodsSku;
      var currentGoods = goodsSku.currentGoods;
      var quantity = goodsSku.selectedQuantity;
      var spec = "";
      if (currentGoods) spec = currentGoods.id;
      that.setData({ isSubmit: true })
        App.postFormid(e.detail.formId);
        cartService.putCart(that.currentGoodsId, spec, quantity, function (res) {
          that.closeSkuModual();
          wx.showToast({
            title: '添加成功，在购物车等亲~',
            icon: 'none',
            duration: 2000
          });
          that.setData({ isSubmit: false })
          if (that.properties._event){
            goodsSku.quantity = quantity;
            goodsSku.currentGoods = currentGoods;
            that.triggerEvent(that.properties._event, goodsSku)
          }
        }, function () {
          that.setData({ isSubmit: false })
        })
      })
    },
    _goToOrder: function (e,id) {
      var that = this;
      App.pageFunInit(() => {
      var goodsSku = that.data.goodsSku;
      var currentGoods = goodsSku.currentGoods;
      var quantity = goodsSku.selectedQuantity;
      var spec = "";
      if (currentGoods) spec = currentGoods.id;
      var cart_id = that.properties.cart_id;
      var seckill_id = that.properties.seckill_id;
      var set_type = that.properties.set_type;
      if (id) {that.currentGoodsId=id;}
      that.setData({ isSubmit: true })
        App.postFormid(e.detail.formId);
        var param = {
          goods_spec_id: spec,
          quantity: quantity
        };
        wx.showLoading({
          title: '加载中'
        });
        var live_id = that.properties.live_id

        if (set_type == "goods") { //立即购买
          if (seckill_id) {
            var params = {
              goods_id: that.currentGoodsId,
              goods_spec_id: spec,
              seckill_id: seckill_id,
              quantity: quantity
            }
            if (live_id) {
              params.source = 1;
              params.source_id = live_id;
            }
            goodService.seckillOrder(params, function (res) {
              that.isSubmiting = false;
              if (res && res.data) {
                var order_id = res.data.order_id;
                wx.redirectTo({
                  url: '/pages/order/found/found?id=' + order_id
                })
              }
            }, function () {
              that.setData({ isSubmit: false })
              that.isSubmiting = false;
            })
          } else {
            var params = {
              type: 1,
              goods_id: that.currentGoodsId,
              spec_id: spec,
              quantity: quantity

            }
            if (live_id) {
              params.source = 1;
              params.source_id = live_id;
            }
            cartService.submitOrder(params, function (res) {
              that.isSubmiting = false;
              if (res && res.data) {
                var order_id = res.data.order_id;
                wx.redirectTo({
                  url: '/pages/order/found/found?id=' + order_id
                })
              }
            }, function () {
              that.setData({ isSubmit: false })
              that.isSubmiting = false;
            })
          }
        } else if (set_type == "tuanOpen"){ //开团
          if (!currentGoods) currentGoods = goodsSku.goods_spec[0];
          var params = {
            fightgroup_id: that.properties.fightgroup,
            fightgroup_item_id: currentGoods.id,
            quantity: quantity
          }
          if (live_id) {
            params.source = 1;
            params.source_id = live_id;
          }
          purchaseService.open(params, function (res) {
            that.isSubmiting = false;
            if (res && res.data) {
              var order_id = res.data.order_id;
              wx.redirectTo({
                url: '/pages/order/found/found?id=' + order_id
              })
            }
          }, function () {
            that.setData({ isSubmit: false })
            that.isSubmiting = false;
          })
        } else if (set_type == "tuanJoin"){ //参团
          if (!currentGoods) currentGoods = goodsSku.goods_spec[0];
          var params = {
            fightgroup_id: that.properties.fightgroup,
            fightgroup_item_id: currentGoods.id,
            fightgroup_launch_id: that.properties.fightgroup_launch_id,
            quantity: quantity
          }
          if (live_id) {
            params.source = 1;
            params.source_id = live_id;
          }
          purchaseService.join(params, function (res) {
            that.isSubmiting = false;
            if (res && res.data) {
              var order_id = res.data.order_id;
              wx.redirectTo({
                url: '/pages/order/found/found?id=' + order_id
              })
            }
          }, function () {
            that.setData({ isSubmit: false })
            that.isSubmiting = false;
          })
        }
        else { //加入购物车
          cartService.modifiCarts(param, cart_id, function (res) {
            if (res && res.data) {
              that.triggerEvent(that.properties._event, res)
              wx.hideLoading();
              that.closeSkuModual();
              wx.showToast({
                title: '添加成功~',
                icon: 'none',
                duration: 2000
              })
              that.setData({ isSubmit: false })
            }
            wx.hideLoading();
          }, function () {
            that.setData({ isSubmit: false })
          })
        }
      })
    },
    //多规格去活动
    goToActivity: function (e) {
      var that = this;
      App.pageFunInit(()=>{
        if (that.isSubmiting) return;
        that.isSubmiting = true;
        var bargain_id = that.properties.bargain_id;
        var goodsSku = that.data.goodsSku;
        var currentGoods = goodsSku.currentGoods;
        var spec = "";
        if (currentGoods) spec = currentGoods.id;
        that.closeSkuModual();
        var live_id = that.properties.live_id
        App.isOverPage(function () {
          wx.navigateTo({
            url: '/activity/pages/bargain/bargain?id=' + bargain_id + '&spec_id=' + spec + '&liveid=' + live_id,
          })
        })
      })
      
    },
    // goToauthorize: function (e) {
    //   var that = this;
    //   var openType = e.currentTarget.dataset.type;
    //   var detail = e.detail;
    //   App.userLogin(detail, function (res) {
    //     switch (openType) {
    //       case 'goToConfirm': that._gotoconfirm(e); break;
    //       case 'goToOrder': 
    //               that._goToOrder(e);  
    //               break;
    //       case 'goToActivity': that.goToActivity(e); break;
    //     }
    //   }, function (res, flag) {
    //     if (flag) {
    //       that.setData({ token: '' })
    //     }
    //   })
    // },
    closeSkuModual: function () {
      this.setData({ skuModal: false })
    },

  }
})