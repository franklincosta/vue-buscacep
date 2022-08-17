/*
  OMDB api key : c5f68364
*/



var ComponentMain = new Vue({
    el:"#ComponentMain",
    data:{
      cep:null,
      cepaddress:{},
      allcepaddress: new Array
    },
    methods:{
      getAddress:function(){
        let nCEP = this.cep;
        this.callGetCEP(nCEP);
      },
      getCEPAddress:function(){
        return this.cepaddress;
      },
      setCEPAddress:function(address){
        this.cepaddress = address;
      },
      callGetCEP: async function(cep){
        const res = await axios.get("https://ws.apicep.com/cep/"+cep+".json")
        this.setCEPAddress(res.data);
      },
      getFavAddress:function(idx){
        return this.allcepaddress[idx];
      },
      getAllFavAddress: function(){
        return this.allcepaddress;
      },
      favAddress: function(address){
        let modelAddress = {
          address:address.address,
          city:address.city,
          district:address.district,
          state: address.state,
          code:address.code
        }
        let alladdressfav = this.allcepaddress;
        for(var c in alladdressfav){
          if(alladdressfav[c].code == modelAddress.code) {
            this.showToastAlreadyFav();
            return; 
          }
        }
        console.log(this.alladdress)
        if(!this.alladdress) this.alladdress = [];
        this.allcepaddress.push(modelAddress);
        this.setLocalStorageCEPAddress();
      },
      favAddressRemove:function(idx){
        this.allcepaddress.splice(idx,1);
      },
      convertFavAddressToString: function(){
        let alladdressconvert = this.getAllFavAddress();
        let strAddress = JSON.stringify(alladdressconvert);
        return strAddress;
      },
      setLocalStorageCEPAddress: function(){
        let strAddress = this.convertFavAddressToString();
        var hasAddress = this.getLocalStorageCEPAddress();
        if(hasAddress) {
          localStorage.removeItem('alladdesscep');
        }
        localStorage.setItem('alladdesscep', strAddress);
      },
      getLocalStorageCEPAddress: function(){
        let strAddress = localStorage.getItem('alladdesscep');
        let arrAddress = JSON.parse(strAddress);
        return arrAddress;
      },
      setFavAddressFromLocalStorage: function(arrAddress){
        this.allcepaddress = arrAddress || [];
      },
      showToastAlreadyFav: function(){
        const toastAlreadyFavAddress = document.getElementById('toastAlreadyFavAddress');
        const toast = new bootstrap.Toast(toastAlreadyFavAddress)
        toast.show()
      }
    },
    mounted:function(){
      let loadalladdress = this.getLocalStorageCEPAddress();
      this.setFavAddressFromLocalStorage(loadalladdress)
    }
})