(function() {
    Office.initialize = () => {
        $('form')
            .removeClass('hidden')
            .on('submit', onSubmit);
    };

    function onSubmit() {
        let currText = $('#text').val();
        insertText(currText);
        return false;
    }

    function insertText(text) {
        Office.context.document.setSelectedDataAsync(text, (res) => {
            if (res.status === 'failed') {
                console.log('Insertion failed', res.error);
            }
        });
    }
})();