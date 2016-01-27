(function() {
    /*
     * Extract host infos from the location.
     * Example: "?_host_Info=Powerpoint|Win32|16.01|en-US"
     */
    const [client, os, version, locale] =
        window.location.search.split('=')[1].split('|');


    Office.initialize = () => {
        $('body').addClass(client.toLowerCase());

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