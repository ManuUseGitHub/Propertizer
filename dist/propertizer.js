var Propertizer = function(){
  var _self = null;
  class Propertizer {
    constructor(){
      _self = this;
    }
    
    init(options){
      this.targetPropertyClass = options.target;
      this.options = options;
    }
    
    checkedOfName (name){
      return $('input[type="radio"][name='+name+']:checked')
    }

    getMatchingInputs(e){
    
      var id = '#'+e.id;
      var inputs = $('');

      var em = $(
        id+' input,'+id+' textarea,'+id+' select,'+
        id+'> :not(.'+this.targetPropertyClass+') input,'+
        id+'> :not(.'+this.targetPropertyClass+') textarea'+
        id+'> :not(.'+this.targetPropertyClass+') select');

      if(em.length){
        em.each(function(){
          if(0 == $(id+' #'+$(this).closest('.'+_self.targetPropertyClass+'').attr('id')).length){
            inputs.push( this)    
          }
        })
      }

      return inputs;
    }

    normalizeValue (realValue,name,e){
      if($(e).attr("type") == 'radio'){  
        realValue = $(this.checkedOfName(name)).val();
        if(!this.checkedOfName(name).length){
          console.log(realValue);
            realValue = this.options.normalized?null:realValue;
        }
      }
      if($(e).attr("type") == 'text' || /^(SELECT|TEXTAREA)$/.test(e.tagName)){ 
        if(this.options.normalized && $(e).val() == "")
          realValue = null;
      }

      var parsed = parseInt(realValue);
      if (!isNaN(parsed)) { realValue = parsed; }

      return realValue;
    }
    
    getPropsFromInput(e){
      var props = {}
      
      this.getMatchingInputs(e).each(function(dex,input){

        var name = $(input).attr('name');

        if(name){
          var value = _self.normalizeValue($(input).val(),name,input); 
          props[name] = value;  

          if(input.tagName == 'SELECT' && value &&!isNaN(value)){
            props[name+'_'] = {'val':value,'txt':input.options[input.selectedIndex].text}
          }
        }
      })

      return props;
    }

    interpolate(obj, e = null){
      if(e == null){
        e = $('body')
      }

      var first = $(e).find('.'+this.targetPropertyClass+'').eq(0)
      var previous;

      if(first.length > 0){
        var nexts = $(first).nextAll('.'+this.targetPropertyClass+'')
        var brothers = $(first).parent().children('.'+this.targetPropertyClass+'')

        $(first).parent().children('div,section').each(function(){
         if(
           (this.tagName == 'DIV' || this.tagName == 'SECTION') &&
           !$(this).hasClass(_self.targetPropertyClass)
         ){
          _self.interpolate(obj,this) 
         }
        })
        brothers.each(function(){
      
          obj[$(this).attr('id')] = _self.getPropsFromInput(this);
          var prop = obj[$(this).attr('id')] ;

          _self.interpolate(prop,this)
          })
        }
      }
    }
    return new Propertizer();
  }.call(this);