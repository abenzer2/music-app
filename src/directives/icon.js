export default {
    beforeMount( el, binding ) {
        let iconClass =`fa fa-${binding.value}  text-2xl`

        if(binding.arg === 'full') {
            iconClass=binding.value
        }

        if(binding.modifiers.right){
            iconClass += ' float-right'
        }
        if(binding.modifiers.yellow) {
            iconClass += ' text-yellow-500'

        }
        else {
            iconClass += ' text-green-500'
        }
        el.innerHTML += `<i class="${iconClass}"></i>`

        
    }
}; 