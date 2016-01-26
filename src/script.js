(function() {
    const $dummy = $('#dummy');

    let n = 0, next = 1;
    function fib() {
        let curr = n;
        [n, next] = [next, next + n];
        return curr;
    }

    function showNextNr() {
        $dummy
            .removeClass('ms-u-slideUpIn20')
            .addClass('ms-u-slideUpOut20');

        setTimeout(() => {
            $dummy
                .text(fib())
                .removeClass('ms-u-slideUpOut20')
                .addClass('ms-u-slideUpIn20');
        }, 167);
    };

    Office.initialize = () => {
        window.setInterval(showNextNr, 2000);
    };
})();