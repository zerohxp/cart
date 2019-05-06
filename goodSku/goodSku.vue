<!--商品规格-->
<template>
  <div class="sku-block" v-transfer-dom>
      <div class='backdrop' @click='closeSkuModual'  v-if="skuShow"></div>
      <div class="stock-keeping-unit"  v-if="skuShow">
        <div class="sku-goods">
          <div class="sku-header">
				    <div class="goods-img" >
              <img v-if="sku.currentGoods && sku.currentGoods.img"  :src="imgBaseURL + '/' + sku.currentGoods.img"/>
					    <img v-else-if="sku.img" :src="imgBaseURL + '/' + sku.img"/>
				    </div>
			    	<div class="goods-info">
              <div class='goods-info-title'>
                <img v-if="sku.type=='discount'" :src="sourceURL+'/applet_weapp/images/icon/icon_09.png'"/>
                <img v-else-if="sku.type=='seckill'" :src="sourceURL+'/applet_weapp/images/icon/ms.png'">
                <img v-else-if="sku.type=='tuan'" :src="sourceURL+'/applet_weapp/images/icon/tg.jpg'"/>
                <span>{{sku.title}}</span>
              </div>
					    <div class='good-price'>
                <span class="price-unit">￥</span>
                <span class="price" v-if="sku.seckillPrice">{{sku.seckillPrice}}</span>
						    <span class="price" v-else-if="sku.currentGoods && sku.currentGoods.vipPrice">{{sku.currentGoods.vipPrice}}</span>
                <span class="price" v-else-if="sku.currentGoods && sku.currentGoods.price">{{sku.currentGoods.price}}</span>
                <span class="price" v-else-if="sku.discount">{{sku.vipPrice}}{{(sku.is_sku != 0) ? '-' + sku.vipMaxPrice : ''}}</span>
                <span class="price" v-else>{{sku.price}}{{(sku.is_sku != 0) ? '-' + sku.max_price : ''}}</span>
              </div>	
              <div class='goods-stock'>
                <span v-if="sku.currentGoods">库存 : {{sku.currentGoods.stock}}<span v-if="sku.unit">{{sku.unit}}</span><span v-else>件</span></span>
                <span v-else>库存 : {{sku.stock}}<span v-if="sku.unit">{{sku.unit}}</span><span v-else>件</span></span>
              </div>
				    </div>					
			    </div>
          <scroller class="sku-scroll" ref="skuScroller">
            <div class="sku-content"  v-if="sku.is_sku==1">
					    <div class="prop-item" v-for="(propItem,propIndex) in sku.goods_props" :key="'goodsku_'+propIndex">
						    <span class="prop-name">{{propItem.name}}</span>
						    <div class="prop-values">
                  <div class="prop-values-block" v-for="(propValueItem,propValueIndex) in propItem.gps" :key="'gps_'+propValueIndex">
                    <span class="value-item disabled" v-if="sku.disabledProps[propItem.id+':'+propValueItem.prop_vid]">{{propValueItem.prop_value}}</span> 
                	  <span v-else-if="sku.selectedProps[propItem.id]==propValueItem.prop_vid" class="value-item selectedprop"  @click.stop="selectProps(propValueItem,propItem)">{{propValueItem.prop_value}}</span>
                    <span v-else class="value-item" @click.stop="selectProps(propValueItem,propItem)">{{propValueItem.prop_value}}</span>
                  </div>
						    </div>
					    </div>
				    </div>
            <div class="sku-quantity" v-if="!hideQuality">
					    <div class='tl'>购买数量：
                <span class='font-orange' v-if="sku.type=='seckill' && activityInfo.cquota > 0">活动期间每人限购{{activityInfo.cquota}}<span v-if="sku.unit">{{sku.unit}}</span><span v-else>件</span></span>
              </div>
					    <div class="sku-options">
                <img class="bnt bnt-mimus" v-if="sku.selectedQuantity > 1" @click.stop="editQuantity('minus')" :src="sourceURL+'/applet_weapp/images/icon/icon_104.png'"/>
						    <img class="bnt bnt-mimus" v-else :src="sourceURL+'/applet_weapp/images/icon/icon_100.png'"/>
						    <input type="number" name="quantity" :readonly="sku.stock==0" v-model="sku.selectedQuantity" @change="inputQuantity"/>
                <img class="normal bnt bnt-plus" v-if="sku.selectedQuantity < sku.stock" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTYxRTAzQUE5M0ExMTFFN0JFRkRGOEI3MDQwM0VGNjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTYxRTAzQUI5M0ExMTFFN0JFRkRGOEI3MDQwM0VGNjQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNjFFMDNBODkzQTExMUU3QkVGREY4QjcwNDAzRUY2NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNjFFMDNBOTkzQTExMUU3QkVGREY4QjcwNDAzRUY2NCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoFlCoAAAAEPSURBVHja7NvfacJQFAfgRLqCBSnd4i7hQ5eoLlWocxSc4Y6hpIgbFE1PaMBA8cm0ueD3g4N5S/w89+QPsW7btpLfmSEAAwYMGDBgwIABAwaMgAEDBgyYEvJQwkGklF7i4z3qK+o157zVMT/ZRD1GPUW9WUqXzAfbz2AMXzBgwIApJjUYHQMGDJg7PSYdc+3UONaLQymlZX+XvJjouzRRq5zzR2kdMyVK1e97Yyn98cXhmDDrqM8JUfbdUipuxtw4n07DHynmxOS3Bc5KYMCAuQeYFoyOAQMGzP/nDEbHgBkjzWD7COaS7pHFLuow5qODW1L7T6QZAwYMGDBgwIABAwaMgAEDBgwYMAXnW4ABAHcNKIE8YQ8WAAAAAElFTkSuQmCC" @click.stop="editQuantity('plus')"/>
              	<img class="normal bnt bnt-plus" v-else src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Nzc4RTYzRUQ5M0E0MTFFN0JEMzJBQUM3NzRCRDc3NkEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Nzc4RTYzRUU5M0E0MTFFN0JEMzJBQUM3NzRCRDc3NkEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3NzhFNjNFQjkzQTQxMUU3QkQzMkFBQzc3NEJENzc2QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3NzhFNjNFQzkzQTQxMUU3QkQzMkFBQzc3NEJENzc2QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PogSxeEAAAEoSURBVHja7NvBasJAEADQJIjk1luvfoClvWy/ol/b/8hB8S+8KT0YKKQjBgy0UAhb3MobGPQk4WVmdjdqPQxDJb5HgwAMGDBgwIABAwYMGDACDBgwYMCUEIsSLiKltIqXdeRH5LbruoOKucTzeJMeIp+00jWWkeeHz3VkC+bnqMGA+TWK+w5HxfyTihnAqBhHglzDV8VoJcu1irn7GZPtsUNK6TFeXmYeAl+nSPFZc3BO1eWRxb60ipmLkquV2vEa7GP+cj7lhNlG9jdclc6ttMkmXMKPE2OmvE1uUhNz4t2q5Ehgg+esZOerlUSJFVNrJa0ExnJt+GqlIuI0WZl6MNfYRR4jP8f3t99++0+k4QsGDBgwYMCAAQMGjAADBgwYMGAKji8BBgBpaTZXdR5PogAAAABJRU5ErkJggg=="/>
					    </div>
			      </div>
          </scroller>
          <template v-if="button">
            <button v-if="sku.btnDisabled" class="weui-btn cart-btn sku-btn weui-btn_disabled" ><span>确定</span></button>
            <button class="weui-btn cart-btn sku-btn"  v-else-if="isSubmit" ><span>提交中</span></button>
            <button v-else class="weui-btn cart-btn sku-btn" @click="goToOrder"><span>确定</span></button>
          </template>
          <template v-else>
            <button v-if="sku.btnDisabled"  class="weui-btn cart-btn sku-btn weui-btn_disabled"><span>加入购物车</span></button>
            <button v-else-if="isSubmit" class="weui-btn cart-btn sku-btn" ><span>提交中</span></button>
            <button v-else class="weui-btn cart-btn sku-btn" @click="gotoConfirm"><span>加入购物车</span></button>
          </template>
        </div>
      </div>
  </div>
</template>

<script>
import { skuData, putCart, seckillOrder, submitOrder, ladderSku, open, join, modifiCarts } from '../../service/main/good.service'
import { TransferDom } from 'vux'
import { checkAuthority } from '../../utils/common'
export default {
  props: {
    goodId: '',
    activityInfo: {
      type: '',
      id: '',
      price: '',
      cquota: ''
    },
    button: false
  },
  components: {},
  directives: {
    TransferDom
  },
  computed: {
  },
  data () {
    return {
      id: '',
      sku: {},
      isSubmit: false,
      backgroundSize: '100% 100%',
      skuShow: false,
      hideQuality: false,
      imgBaseURL: this.$store.state.imgBaseUrl,
      sourceURL: this.$store.state.sourceUrl
    }
  },
  created () {
  },
  methods: {
    tip (msg) {
      this.$vux.toast.show({
        position: 'middle',
        type: 'text',
        text: msg,
        width: '10rem',
        time: 2000
      })
    },
    searchSku (id, type) {
      if (!id) return
      this.id = id
      var self = this
      if (type === 'tuan') {
        ladderSku(id, (res) => {
          self.renderInfo(res)
        })
        return
      }
      skuData(id, (res) => {
        self.renderInfo(res)
      })
    },
    renderInfo (res) {
      var self = this
      if (res && res.data) {
        var sku = res.data
        sku.selectedQuantity = 1
        sku.selectedProps = {}
        sku.disabledProps = {}
        sku.abledProps = {}
        var disabledSpec = []
        var abledSpec = []
        var discount = sku.discount
        if (discount) {
          var price = sku.price
          price = Number(price) * Number(discount) * 0.1
          price = (Math.round(price * 100) / 100).toFixed(2)
          sku.vipPrice = price
          if (sku.is_sku === 1 || sku.is_sku === 2) {
            var maxPrice = sku.max_price
            if (maxPrice && maxPrice !== '0.00') {
              maxPrice = Number(maxPrice) * Number(discount) * 0.1
              maxPrice = (Math.round(maxPrice * 100) / 100).toFixed(2)
              sku.vipMaxPrice = maxPrice
            } else {
              sku.vipMaxPrice = '0.00'
            }
          }
        }
        if (sku.is_sku === 1) {
          sku.btnDisabled = true
          let goodsSpec = sku.goods_spec
          for (var spec in goodsSpec) {
            var _stock = goodsSpec[spec].stock
            if (_stock === 0) {
              sku.disabledProps[spec] = true
              disabledSpec.push(spec)
            } else {
              abledSpec.push(spec)
            }
          }
        }
        if (this.activityInfo && this.activityInfo.type) {
          if (this.activityInfo.type === 'seckill') {
            sku.type = this.activityInfo.type
            sku.seckillPrice = this.activityInfo.price
          } else if (this.activityInfo.type === 'bargain') {
            self.hideQuality = true
          } else if (this.activityInfo.type === 'discount' || this.activityInfo.type === 'cartList') {
            sku.type = 'discount'
          } else if (this.activityInfo.type === 'cart') {
            let specId = this.activityInfo.spec_id
            if (specId) {
              let goodsSpec = sku.goods_spec
              for (let key in goodsSpec) {
                let item = goodsSpec[key]
                if (specId === item.id) {
                  let keyArry = key.split(';')
                  let itemStock = item.stock
                  if (itemStock === 0) {
                    keyArry.forEach((keyItem) => {
                      if (keyItem) {
                        sku.disabledProps[keyItem] = true
                        disabledSpec.push(keyItem)
                      }
                    })
                  } else {
                    sku.currentGoods = item
                    let discount = sku.discount
                    if (discount) {
                      let price = item.price
                      price = Number(price) * Number(discount) * 0.1
                      price = (Math.ceil(price * 100) / 100).toFixed(2)
                      sku.currentGoods.vipPrice = price
                    }
                    keyArry.forEach((keyItem) => {
                      if (keyItem) {
                        let KeyItemArry = keyItem.split(':')
                        if (KeyItemArry && KeyItemArry.length === 2) {
                          sku.selectedProps[KeyItemArry[0]] = KeyItemArry[1]
                        }
                      }
                    })
                    sku.btnDisabled = false
                  }
                  break
                }
              }
            }
            sku.selectedQuantity = this.activityInfo.quantity
          }
        }
        sku.disabledSpec = disabledSpec
        sku.abledSpec = abledSpec
        self.sku = sku
        self.skuShow = true
      }
    },
    closeSkuModual () {
      this.skuShow = false
    },
    editQuantity (option) {
      var sku = this.sku
      var stock = sku.stock
      if (sku.currentGoods) {
        stock = sku.currentGoods.stock
      }
      if (option === 'minus') {
        if (sku.selectedQuantity === 1) {
          this.tip('至少选择一个')
          return
        }
        this.sku.selectedQuantity--
      } else if (option === 'plus') {
        if (sku.selectedQuantity === stock) {
          this.tip('库存不足')
          return
        }
        this.sku.selectedQuantity++
      }
      // 判断是否超出秒杀限制数量
      if (this.activityInfo && this.activityInfo.cquota > 0) {
        var cquota = this.activityInfo.cquota
        if (sku.selectedQuantity > cquota) {
          this.tip('购买数量已达上线')
          this.sku.selectedQuantity = cquota
        }
      }
    },
    inputQuantity () {
      var sku = this.sku
      var stock = sku.stock
      if (sku.currentGoods) {
        stock = sku.currentGoods.stock
      }
      var selectedQuantity = this.sku.selectedQuantity
      selectedQuantity = selectedQuantity.replace(/^[0]+/, '')
      selectedQuantity = Number(selectedQuantity)
      if (isNaN(selectedQuantity)) {
        this.tip('请输入正确的数字')
        this.sku.selectedQuantity = 1
        return
      }
      if (selectedQuantity < 1) {
        this.tip('至少选择一个')
        this.sku.selectedQuantity = 1
        return
      }
      if (selectedQuantity > stock) {
        this.tip('库存不足')
        this.sku.selectedQuantity = stock
        return
      }
      // 判断是否超出秒杀限制数量
      if (this.activityInfo && this.activityInfo.cquota) {
        var cquota = this.activityInfo.cquota
        if (sku.selectedQuantity > cquota) {
          this.tip('购买数量已达上线')
          this.sku.selectedQuantity = cquota
        }
      }
    },
    selectProps (propValueItem, propItem) {
      var goodsSku = this.sku
      var propId = propItem.id
      var propValueId = propValueItem.prop_vid
      var selectedProps = goodsSku.selectedProps
      if (!selectedProps) selectedProps = {}
      selectedProps[propId] = propValueId
      var disabledSpec = goodsSku.disabledSpec
      var abledSpec = goodsSku.abledSpec
      var key = propId + ':' + propValueId
      var disabledProps = {}
      var selectedPropsName = Object.getOwnPropertyNames(selectedProps)
      selectedPropsName = selectedPropsName.filter((item) => {
        return item !== '__ob__'
      })
      var goodsPropsName = Object.getOwnPropertyNames(goodsSku.goods_props)
      goodsPropsName = goodsPropsName.filter((item) => {
        return item !== '__ob__'
      })
      var len = selectedPropsName.length
      if (len !== goodsPropsName.length) {
        disabledSpec.forEach((_disabledSpec) => {
          var _len = 1
          for (var pK in selectedProps) {
            var _k = pK + ':' + selectedProps[pK]
            if (_disabledSpec.indexOf(_k) !== -1) {
              if (_disabledSpec.indexOf(_k + ';') !== -1) {
                _disabledSpec = _disabledSpec.replace(_k + ';', '')
                if (len === _len) {
                  let _array = _disabledSpec.split(';')
                  _array.forEach((item) => {
                    disabledProps[item] = true
                  })
                }
              } else if (_disabledSpec.indexOf(';' + _k) !== -1) {
                _disabledSpec = _disabledSpec.replace(';' + _k, '')
                if (len === _len) {
                  let _array = _disabledSpec.split(';')
                  _array.forEach((item) => {
                    disabledProps[item] = true
                  })
                }
              } else {
                disabledProps[key] = true
              }
              _len++
            }
          }
        })
        abledSpec.forEach((_abledSpec) => {
          var _len = 1
          for (var pK in selectedProps) {
            var _k = pK + ':' + selectedProps[pK]
            if (_abledSpec.indexOf(_k) !== -1) {
              if (_abledSpec.indexOf(_k + ';') !== -1) {
                _abledSpec = _abledSpec.replace(_k + ';', '')
                if (len === _len) {
                  let _array = _abledSpec.split(';')
                  _array.forEach((item) => {
                    disabledProps[item] = false
                  })
                }
              } else if (_abledSpec.indexOf(';' + _k) !== -1) {
                _abledSpec = _abledSpec.replace(';' + _k, '')
                if (len === _len) {
                  let _array = _abledSpec.split(';')
                  _array.forEach((item) => {
                    disabledProps[item] = false
                  })
                }
              } else {
                disabledProps[key] = false
              }
              _len++
            }
          }
        })
      }
      if (len === goodsPropsName.length) {
        var goodsPropsArray = goodsSku.goods_props
        var goodsPropsItem = goodsPropsArray[propId]
        var goodsPropsItemGps = goodsPropsItem.gps
        for (var gpsI in goodsPropsItemGps) {
          var goodsPropVid = goodsPropsItemGps[gpsI].prop_vid
          selectedProps[propId] = goodsPropVid
          var goodsPropsItemSpan = ''
          for (let key in selectedProps) {
            if (goodsPropsItemSpan) {
              goodsPropsItemSpan += ';' + key + ':' + selectedProps[key]
            } else {
              goodsPropsItemSpan = key + ':' + selectedProps[key]
            }
          }
          var _key2 = propId + ':' + goodsPropVid
          disabledProps[_key2] = false
          disabledSpec.forEach((item) => {
            if (goodsPropsItemSpan === item) {
              disabledProps[_key2] = true
            }
          })
        }
      }
      selectedProps[propId] = propValueId
      goodsSku.selectedProps = selectedProps
      goodsSku.disabledProps = disabledProps
      var goodsProps = goodsSku.goods_props
      var _specKey = ''
      for (let key in goodsProps) {
        if (selectedProps[key]) {
          if (_specKey) {
            _specKey += ';' + key + ':' + selectedProps[key]
          } else {
            _specKey = key + ':' + selectedProps[key]
          }
        } else {
          this.sku = goodsSku
          return
        }
      }
      var goodsSpec = goodsSku.goods_spec
      if (goodsSpec[_specKey]) {
        goodsSku.currentGoods = goodsSpec[_specKey]
        goodsSku.selectedQuantity = 1
        if (goodsSku.currentGoods.stock === 0) {
          goodsSku.btnDisabled = true
        } else {
          goodsSku.btnDisabled = false
        }
        var discount = goodsSku.discount
        if (discount) {
          var price = goodsSku.currentGoods.price
          price = Number(price) * Number(discount) * 0.1
          price = (Math.ceil(price * 100) / 100).toFixed(2)
          goodsSku.currentGoods.vipPrice = price
        }
      } else {
        this.tip('选择规格不正确')
      }
      this.sku = goodsSku
    },
    gotoConfirm () {
      var self = this
      checkAuthority(() => {
        var goodsSku = self.sku
        var currentGoods = goodsSku.currentGoods
        var quantity = goodsSku.selectedQuantity
        var spec = ''
        var price = goodsSku.price
        if (goodsSku.discount) price = goodsSku.vipPrice
        if (currentGoods) {
          spec = currentGoods.id
          if (currentGoods.price) price = currentGoods.price
          if (currentGoods.vipPrice) price = currentGoods.vipPrice
        }
        quantity = quantity + ''
        quantity = quantity.replace(/\s+/g, '')
        quantity = quantity.replace(/^[0]+/g, '')
        if (!/^[0-9]+$/.test(quantity)) {
          self.tip('请输入正确的数量')
          return
        }
        quantity = Number(quantity)
        self.isSubmit = true
        var params = {}
        params = {
          goods_id: self.id,
          goods_spec_id: spec,
          quantity: quantity
        }
        putCart(params, (res) => {
          self.tip('添加成功，在购物车等亲~')
          self.isSubmit = false
          self.skuShow = false
          var activityInfo = self.activityInfo || {}
          if (activityInfo.type === 'cartList') {
            self.$emit('complete', price, quantity)
          }
        }, () => {
          self.isSubmit = false
        })
      })
    },
    goToOrder () {
      var self = this
      checkAuthority(() => {
        var goodsSku = self.sku
        var currentGoods = goodsSku.currentGoods
        var quantity = goodsSku.selectedQuantity
        var spec = ''
        if (currentGoods) spec = currentGoods.id
        var activityInfo = self.activityInfo || {}
        var type = activityInfo.type
        quantity = quantity + ''
        quantity = quantity.replace(/\s+/g, '')
        quantity = quantity.replace(/^[0]+/g, '')
        if (!/^[0-9]+$/.test(quantity)) {
          self.tip('请输入正确的数量')
          return
        }
        quantity = Number(quantity)
        self.isSubmit = true
        var params = {}
        if (type === 'seckill') {
          params = {
            goods_id: self.id,
            goods_spec_id: spec,
            seckill_id: activityInfo.id,
            quantity: quantity
          }
          seckillOrder(params, (res) => {
            self.isSubmit = false
            self.skuShow = false
            if (res && res.data) {
              let orderId = res.data.order_id
              self.$router.push({name: 'orderIndex', params: {id: orderId}})
            }
          }, () => {
            self.isSubmit = false
          })
        } else if (type === 'tuanOpen') {
          if (!currentGoods) currentGoods = goodsSku.goods_spec[0]
          params = {
            fightgroup_id: activityInfo.id,
            fightgroup_item_id: currentGoods.id,
            quantity: quantity
          }
          open(params, (res) => {
            self.isSubmit = false
            self.skuShow = false
            if (res && res.data) {
              let orderId = res.data.order_id
              self.$router.push({name: 'orderIndex', params: {id: orderId}})
            }
          }, () => {
            self.isSubmit = false
          })
        } else if (type === 'tuanJoin') {
          if (!currentGoods) currentGoods = goodsSku.goods_spec[0]
          params = {
            fightgroup_id: activityInfo.id,
            fightgroup_item_id: currentGoods.id,
            fightgroup_launch_id: activityInfo.fightgroup_launch_id,
            quantity: quantity
          }
          join(params, (res) => {
            self.isSubmit = false
            self.skuShow = false
            if (res && res.data) {
              let orderId = res.data.order_id
              self.$router.push({name: 'orderIndex', params: {id: orderId}})
            }
          }, () => {
            self.isSubmit = false
          })
        } else if (type === 'bargain') {
          self.$router.push({name: 'bargainIndex', params: {id: activityInfo.id}, query: {spec: spec}})
        } else if (type === 'cart') {
          let specStr = ''
          if (currentGoods) {
            specStr = currentGoods.props_str
          }
          params = {
            quantity: quantity,
            goods_spec_id: spec || 0,
            cart_id: activityInfo.id
          }
          modifiCarts(params, (res) => {
            if (res && res.data) {
              self.isSubmit = false
              self.skuShow = false
              if (activityInfo.dis) {
                let disData = res.data.all_discount_data
                self.$emit('complete', disData[activityInfo.disIndex], activityInfo.disIndex, true)
                return
              }
              let item = activityInfo.item
              item.goods_props = specStr
              item.goods_price = goodsSku.price
              if (currentGoods) {
                item.goods_price = currentGoods.price
                item.goods_spec_id = currentGoods.id
                item.goods_img = currentGoods.img
                if (goodsSku.discount) {
                  item.goods_vip_discount_rate = currentGoods.vipPrice
                }
              } else {
                if (goodsSku.discount) {
                  item.goods_vip_discount_rate = goodsSku.vipPrice
                }
              }
              item.goods_pur_num = quantity
              item.quantity = quantity
              self.$emit('complete', item, activityInfo.index)
            }
          }, () => {
            self.isSubmit = false
          })
        } else {
          params = {
            goods_id: self.id,
            spec_id: spec,
            type: 1,
            quantity: quantity
          }
          submitOrder(params, (res) => {
            self.isSubmit = false
            self.skuShow = false
            if (res && res.data) {
              let orderId = res.data.order_id
              self.$router.push({name: 'orderIndex', params: {id: orderId}})
            }
          }, () => {
            self.isSubmit = false
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.stock-keeping-unit {
	position: fixed;	bottom: 0;	width: 100%;	height: auto;		z-index: 999992;}
.stock-keeping-unit .sku-goods {
	position: relative;	bottom: 0;	width: 100%;	background: #fff;z-index: 999993;}
.sku-goods .sku-header {	display: box;display: -webkit-box;    display: -moz-box; display: -ms-flexbox;display: -webkit-flex; display: flex;  -webkit-box-orient: horizontal; -webkit-flex-direction: row;  -moz-flex-direction: row;-ms-flex-direction: row;-o-flex-direction: row;
flex-direction: row;height: 4rem;padding-left: 0.56rem; border-bottom: 1px solid #eaeaea;
}
.sku-header .goods-img {
	width: 4rem;height: 4rem;margin-top: -0.76rem;border: 1px solid #e6e6e6;
	background: #fff; top: 0; left:0.56rem;}
.sku-header .goods-img img {	display: block;	width: 4rem;	height: 4rem;}
.sku-header .goods-info{ padding-left:0.6rem;  padding-right:0.6rem;  margin-top:0.3rem; }
.sku-header .goods-info .goods-info-title{
  text-overflow:ellipsis;-webkit-line-clamp:2;-webkit-box-orient: vertical;   display: -webkit-box;line-height:0.84rem;	overflow: hidden;}
.sku-header .goods-info img{width: 54rpx;height: 0.52rem;vertical-align: middle;margin-right: 0.24rem;}
.sku-header .goods-info .good-price {	color: #ff5500;	font-size: 0.76rem;}
.sku-header .goods-info .price-unit{  font-size: 0.4rem;}
.sku-header .goods-info .goods-stock{font-size: 0.5rem;color:#8e8e8e;line-height: 48rpx;}

.sku-goods scroll-view {
	position: relative;
}
.sku-goods .sku-content {	padding:0 0.56rem;}
.sku-goods .sku-content .prop-item {	padding-top: 0.4rem;	border-bottom: 1px solid #eaeaea;}
.sku-content .prop-item .prop-name {	 word-break: break-all;font-size: 0.52rem;color: #333333;line-height: 0.8rem;}
.sku-content .prop-item .prop-values {	padding-bottom:0.6rem;}
.sku-content .prop-item .prop-values .prop-values-block{display: inline-block;margin-right:0.4rem;}
.sku-content .prop-item .value-item { word-break: break-all;padding: 0.24rem 0.44rem;	font-size: 0.5rem;line-height: 0.8rem;color: #333;border:1px solid #999;	border-radius: 0.12rem;display:inline-block;margin-top:0.4rem;}
.sku-content .prop-item .prop-values-block:last-child{	margin-right: 0;}
.sku-content .prop-item .selectedprop {color: #fff;	background: #ff5500;border:0;content: none}
.sku-content .prop-item .selectedprop::after {display: none;content: none}
.sku-content .prop-item .selectedprop::before {display: none;content: none}
.sku-content .prop-item .value-item .default {
	color: #999;
	border: 1px solid #999;
}
.sku-content .prop-item  .disabled {
	color: #cccccc;
	background: #f2f2f2;
  border:1px solid #cccccc;
}
.sku-goods .sku-quantity {padding: 0.4rem 0;line-height:1.4rem;text-align:right;height:1.4rem;    white-space: nowrap;width: 100%;overflow: hidden;}
.sku-goods .sku-quantity .tl { font-size: 0.5rem;color: #666666;float:left;margin-left: 0.56rem;}
.sku-options{display: inline-block;word-break: break-all;height: 1.3rem;border: 1px solid #999;border-radius: 0.12rem;position: relative;right:0.56rem;}
.sku-options .bnt{width: 1.3rem; height: 1.3rem; border-radius: 0.08rem; display: inline-block; text-align: center; float: left; -webkit-box-sizing: border-box; box-sizing: border-box;}
.sku-options .bnt.bnt-plus{border-left: 1px solid #999; border-bottom-left-radius: 0; border-top-left-radius: 0;}
.sku-options .bnt.bnt-mimus{    border-right: 1px solid #999; border-bottom-right-radius: 0;border-top-right-radius: 0;}
/* .sku-options .bnt:last-child{
  border-left:0.5px solid #999;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
} */

.sku-quantity .sku-options input {width: 1.6rem; padding: 0 0.1rem; height: 1.2rem; background: #fff; text-align: center; float: left; margin-top: 0.04rem; font-size: 0.8rem;color: #333; border: 0;}
.sku-btn.cart-btn{font-size: 0.56rem;background: -webkit-linear-gradient(left, #ff5500 , #ff6600);width:100%;line-height:1.8rem;margin:0;}
.sku-scroll{max-height: 12.4rem;position: relative;}
.backdrop{
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0,0,0,.4);
    z-index:999991;
}
.weui-btn {
    position: relative;
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0.28rem;
    padding-right: 0.28rem;
    box-sizing: border-box;
    font-size: 0.56rem;
    text-align: center;
    text-decoration: none;
    color: #FFFFFF;
    line-height:1.8rem;
    border-radius: 0.1rem;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    overflow: hidden;
}
.weui-btn_mid::after,.weui-btn_plain-default::after,.weui-btn_primary::after,.weui-btn_disabled::after,.weui-btn_warn::after,.cart-btn::after,.buy-btn::after{
  content: none
}
.cart-btn{
   background: -webkit-linear-gradient(left, #ff9900 , #ffaa00);
   border-radius:0;
   border:0
}
.weui-btn_disabled{
    color: rgba(255, 255, 255, 0.4);
}
.font-orange{
    color:#FF5500;
}

</style>
<style>
</style>
