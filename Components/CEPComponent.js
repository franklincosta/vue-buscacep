/*
  OMDB api key : c5f68364
*/

Vue.component('cep-component', {
  data:function(){
    return {
      cep:null,
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
      this.callGetCEP(nCEP);
    },
    getCEPAddress:function(){
      return this.cepaddress;
    },
    setCEPAddress:function(address){
      this.cepaddress = address;
    },
    callAPICEP: async function(cep, nextApi){
      var idxAPI = 0;
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

      if(nextApi && nextApi > arrAPICEP.length) return "endapi";

      if(typeof nextApi == 'number'){
        idxAPI = nextApi;
      } 
     
      var urlApiCEP = arrAPICEP[idxAPI].url.replace("{cep}", cep);
      const res = await axios.get(urlApiCEP);
      if(res.status != 200) return 'errorapi';
      if(res.data.status == 400 && arrAPICEP.length == nextApi) return 400;
      if(res.data.status == 400){
        idxAPI += 1;
        return this.callAPICEP(cep, idxAPI);
      } 
      var dataRes = res.data;
      var modelApi = arrAPICEP[idxAPI].model
      for( var m in modelApi){
        dataAddressModel[m] = dataRes[modelApi[m]];
      }
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
      this.setCEPAddress(dataCEP);
    },
    getFavAddress:function(idx){
      return this.allcepaddress[idx];
    },
    getAllFavAddress: function(){
      return this.allcepaddress;
    },
    favAddress: function(address){

      let modelAddress =  this.models.cep;

      modelAddress.address = address.address;
      modelAddress.city = address.city;
      modelAddress.district = address.district;
      modelAddress.state =  address.state;
      modelAddress.code = address.code;
      
      let alladdressfav = this.allcepaddress;
      
      for(var c in alladdressfav){
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
        this.getAddress(this.dataFormCEP.cep)
        return true;
      }
      if(!this.dataFormCEP.cep) this.errorsCEPForm.cep = "Campo obrigatório";
      
      return false;
    },
    changeInput:function(e){
      var modelForm = e.currentTarget.name;
      if(this.dataFormCEP[modelForm]) this.resetInputForm(modelForm)
    },
    resetInputForm:function(model){
      this.errorsCEPForm[model] = null;
    }
  },
  mounted:function(){   
    let loadalladdress = this.getLocalStorageCEPAddress();
    this.setFavAddressFromLocalStorage(loadalladdress);
    this.getAddress();
  }
})