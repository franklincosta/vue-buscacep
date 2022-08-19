Vue.component('cep-component', {
  data:function(){
    return {
      cep:null,
      busy:false,
      showMApFavAddress:false,
      cepaddress:{},
      dataFormCEP:{
        cep:null
      },
      allcepaddress: [],
      errorsCEPForm: {
        cep:null
      },
      models:{
        cep:{
          address:null,
          city:null,
          district:null,
          state: null,
          code:null,
        }
      }
    }
  },
  methods:{
    getAddress:function(){
      let nCEP = this.dataFormCEP.cep;
      this.setCEPAddress();
      this.callGetCEP(nCEP);
    },
    getCEPAddress:function(){
      return this.cepaddress;
    },
    setCEPAddress:function(address){
      this.cepaddress = address || [];
    },
    callAPICEP: async function(cep, nextApi){
      let idxAPI = 0;
      let dataAddressModel = this.models.cep;
      const arrAPICEP = [
        {
          url:"https://ws.apicep.com/cep/{cep}.json", 
          model:{
            address:"address",
            city:"city",
            district:"district",
            state:"state",
            code:"code",
          }
        },
        {
          url:"https://viacep.com.br/ws/{cep}/json",
          model:{
            code:"cep",
            address:"logradouro",
            district: "bairro",
            city:"localidade",
            state: "uf"
          }
        }
      ];
      const configMaps = {
        url:"https://www.google.com.br/maps/place/{district},{city},{state},{code}"
      }

      if(nextApi && nextApi > arrAPICEP.length) return "endapi";

      if(typeof nextApi == 'number'){
        idxAPI = nextApi;
      } 
     
      let urlApiCEP = arrAPICEP[idxAPI].url.replace("{cep}", cep);
      const res = await axios.get(urlApiCEP);
      if(res.status != 200) return 'errorapi';
      if(res.data.status == 400 && arrAPICEP.length == nextApi) return 400;
      if(res.data.status == 400){
        idxAPI += 1;
        return this.callAPICEP(cep, idxAPI);
      } 
      let dataRes = res.data;
      let modelApi = arrAPICEP[idxAPI].model
      for( let m in modelApi){
        dataAddressModel[m] = dataRes[modelApi[m]];
      }
      let urlMapsAddress = configMaps.url.replace('{district}', dataAddressModel.district)
      urlMapsAddress = urlMapsAddress.replace('{city}', dataAddressModel.city)
      urlMapsAddress = urlMapsAddress.replace('{state}', dataAddressModel.state)
      urlMapsAddress = urlMapsAddress.replace('{code}', dataAddressModel.code)
      
      dataAddressModel.mapsgoogle = urlMapsAddress;

      return dataAddressModel;
    },
    callGetCEP: async function(cep){
      if(!cep) return;
      const dataCEP = await this.callAPICEP(cep);
      
      if(dataCEP == 400){
        this.showToastFloodService();
        return;
      }else if(dataCEP == 'errorapi'){
        this.showToastErrorService();
      }
      this.busy = false;
      this.setCEPAddress(dataCEP);
    },
    getFavAddress:function(idx){
      return this.allcepaddress[idx];
    },
    getAllFavAddress: function(){
      return this.allcepaddress;
    },
    favAddress: function(){
      let address = this.getCEPAddress();
      let modelAddress = this.models.cep;
      
      modelAddress.address = address.address;
      modelAddress.city = address.city;
      modelAddress.district = address.district;
      modelAddress.state =  address.state;
      modelAddress.code = address.code;
      
      let alladdressfav = this.getAllFavAddress();
      for(let c in alladdressfav){
        if(alladdressfav[c].code == modelAddress.code) {
          this.showToastAlreadyFav();
          return; 
        }
      }
      if(!this.alladdress) this.alladdress = [];
      this.allcepaddress.push(modelAddress);
      this.setLocalStorageCEPAddress();
    },
    favAddressRemove:function(idx){
      let addressRemove = this.allcepaddress[idx];
      let localStorageFav = this.getLocalStorageCEPAddress();
      for(let f = 0; f < localStorageFav.length; f++){
        if(localStorageFav[f].code == addressRemove.code) {
          localStorageFav.splice(f, 1);
          break;
        }
      }
      this.allcepaddress.splice(idx,1);
      this.setLocalStorageCEPAddress();
    },
    showSideBarFavAddress:function(){

    },
    convertFavAddressToString: function(){
      let alladdressconvert = this.getAllFavAddress();
      let strAddress = JSON.stringify(alladdressconvert);
      return strAddress;
    },
    setLocalStorageCEPAddress: function(){
      let strAddress = this.convertFavAddressToString();
      let hasLocalAddress = this.getLocalStorageCEPAddress();
      if(hasLocalAddress) {
        localStorage.removeItem('alladdesscep');
      }
      localStorage.setItem('alladdesscep', strAddress);
    },
    getLocalStorageCEPAddress: function(){
      let strAddress = localStorage.getItem('alladdesscep');
      let arrAddress = JSON.parse(strAddress);
      return arrAddress;
    },
    setFavAddressFromLocalStorage: function(){
      let loadalladdress = this.getLocalStorageCEPAddress();
      this.allcepaddress = loadalladdress || [];
    },
    showToastById:function(id){
      const toastElem = document.getElementById(id);
      const toast = new bootstrap.Toast(toastElem)
      toast.show();
    },
    showToastAlreadyFav: function(){
      this.showToastById('toastAlreadyFavAddress')
    },
    showToastFloodService:function(){
      this.showToastById('toastFloodService')
    },
    showToastErrorService:function(){
      this.showToastById('toastErrorService')
    },
    formCepValidate: function(){
      if(this.dataFormCEP.cep){
        this.busy = true;
        this.getAddress(this.dataFormCEP.cep)
        return true;
      }
      if(!this.dataFormCEP.cep) this.errorsCEPForm.cep = "Campo obrigatório";
      
      return false;
    },
    changeInput:function(e){
      let modelForm = e.currentTarget.name;
      if(this.dataFormCEP[modelForm]) this.resetInputForm(modelForm)
    },
    resetInputForm:function(model){
      this.errorsCEPForm[model] = null;
    }
  },
  mounted:function(){   
    this.setFavAddressFromLocalStorage();
    this.getAddress();
  }
})