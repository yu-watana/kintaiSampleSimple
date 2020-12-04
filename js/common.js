let workingState = localStorage.getItem(`workingState`)

// static function
function currentdayOfWeek(index) {
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][index]
    return dayOfWeek
}

function zeroPadding(time) {
    let zeroPaddingTime = "--:--"
    if (time === "") {
        return zeroPaddingTime
    }
    zeroPaddingTime = ("0" + time).slice(-5)
    return zeroPaddingTime
}

function yyyymmdd(y, m, d) {
    var y0 = ('000' + y).slice(-4)
    var m0 = ('0' + m).slice(-2)
    var d0 = ('0' + d).slice(-2)
    return `${ y0 }-${ m0 }-${ d0 }`
}

function disableButtonForWorkingstate() {
    if (workingState === "leaved") {
        changeWorkingState("", "disabled")
    } else {
        // workもしくは初期表示の場合。わかりにくければ初期表示とworkで分ける。
        changeWorkingState("disabled", "")
    }
}