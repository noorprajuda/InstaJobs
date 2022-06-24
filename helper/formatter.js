function formatCurrency(input){
    return input.toLocaleString('id-ID',{ style: 'currency', currency:'IDR'})
}


module.exports = formatCurrency