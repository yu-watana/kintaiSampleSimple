// TODO: 後々は処理ごとにjsファイルに分ける
// TODO: リファクタリング
// TODO: export,import使ってみる
// TODO: validateする
// TODO: 休憩処理追加
// TODO: 新規で編集追加処理
// TODO: コピーモードもしくは出力処理追加
// TODO: MySQLかFireStoreに保存に変更
// TODO: 作業時間が入ってない時の表示修正


// only js
const date = new Date()
const thisMonth = date.getMonth() + 1

// use html element
// TODO: スコープ的には広いから使用箇所で宣言したい
const menuButton = document.querySelector(".button-menu")
const nav = document.querySelector("nav")
const leaveButton = document.querySelector(".button-leaved")
const workButton = document.querySelector(".button-work")
const tBody = document.querySelector(".table-body")
const tFoot = document.querySelector(".table-footer")
const lastMonthButton = document.querySelector(".button-last-month")
const nextMonthButton = document.querySelector(".button-next-month")

let db
let selectedMonth
let topKintai = {}

// menu setting
menuButton.addEventListener("click", () => {
    nav.classList.toggle("open-menu")
})

// work button setting
workButton.addEventListener("click", () => {
    alert(cheeringWorkTitle)
})

workButton.addEventListener("click", () => {
    changeWorkingState("disabled", "")
    localStorage.setItem(`workingState`, work)
})

// leave button setting
leaveButton.addEventListener("click", () => {
    alert(goodWorkTitle)
})

leaveButton.addEventListener("click", () => {
    changeWorkingState("", "disabled")
    localStorage.setItem(`workingState`, leaved)
})

lastMonthButton.addEventListener("click", () => {
    updateUIWith(selectedMonth - 1)
})

nextMonthButton.addEventListener("click", () => {
    updateUIWith(selectedMonth + 1)
})

workButton.addEventListener("click", () => {
    addKintai()
})

leaveButton.addEventListener("click", () => {
    putKintai()
})

window.onload = () => {

    // UI
    disableButtonForWorkingstate()
    setInterval(`today()`, 1000)

    // request localDB
    setupDb()
}

function changeWorkingState(workButtonStatus, leaveButtonStatus) {
    workButton.disabled = workButtonStatus
    leaveButton.disabled = leaveButtonStatus
}

// display date
function today() {
    const currentTime = date.toLocaleString()
    document.getElementById("now-date").textContent = currentTimeTitle + currentTime
}

// stamping time 作ったけどいるか？
const stampingTime = (workingState) => {
    const stampingTime = roundTimeWith(workingState)
    console.log(`stampingTime:` + stampingTime)
    return stampingTime
}

// Round the time every 15 minutes
function roundTimeWith(workingState) {
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let roundMinutes
    switch (true) {
        case minutes < 15:
            roundMinutes = workingState === leaved ? `00` : 15
            return `${hours}:${roundMinutes}`
        case minutes >= 15 && minutes < 30:
            roundMinutes = workingState === leaved ? 15 : 30
            return `${hours}:${roundMinutes}`
        case minutes >= 30 && minutes < 45:
            roundMinutes = workingState === leaved ? 30 : 45
            return `${hours}:${roundMinutes}`
        case minutes >= 45:
            hours = workingState === leaved ? hours : hours + 1
            roundMinutes = workingState === leaved ? 45 : `00`
            return `${hours}:${roundMinutes}`
        default:
            return `${hours}:${roundMinutes}`
    }
}

// MARK:- Kintai Action Method

const isKintaiInfoEmpty = (info) => {
    return !Object.keys(info).length;
}

function kintaiInfoWith(data) {
    let kintaiInfo = {}
    for (let i = 0; i < data.length; i++) {
        console.log("data is not defined")
        console.log(`data[i] is ${data[i]}`)
        kintaiInfo = data[i]
        return kintaiInfo
    }
    return kintaiInfo
}

function addKintai() {
    requestKintaiGetAll((data) => {

        let kintaiInfo = {
            year: date.getFullYear(),
            month: thisMonth,
            day: date.getDate(),
            dayOfWeek: currentdayOfWeek(date.getDay()),
            workTime: stampingTime(work),
            leavedTime: "",
            breakTime: "",
            workingHour: ""
        }

        let info = kintaiInfoWith(data)
        if (isKintaiInfoEmpty(info)) {
            let newInfo = {
                month: `${thisMonth}月`,
                kintaiList: [kintaiInfo]
            }
            requestKintaiAdd(newInfo)
            return
        }

        if (info["month"] === `${thisMonth}月`) {
            let kintaiList = info["kintaiList"]
            kintaiList.push(kintaiInfo)
            info["kintaiList"] = kintaiList
            requestKintaiPut(info)
        }

    }, () => {
        console.log("addKintai no match data")
    })
}

function putKintai() {
    requestKintaiGetAll((data) => {
        let info = kintaiInfoWith(data)
        if (info["month"] === `${thisMonth}月`) {
            let kintaiList = info["kintaiList"]
            if (isKintaiInfoEmpty(kintaiList)) {
                return
            }

            for (let j = 0; j < kintaiList.length; j++) {
                let kintaiInfo = kintaiList[j]
                if (kintaiInfo["day"] == `${date.getDate()}`) {
                    kintaiInfo.leavedTime = stampingTime(leaved)
                        // TODO: breakTimeの仕様を決定する
                    kintaiInfo.breakTime = "1:00"
                    let workedDate = new Date(kintaiInfo.year,
                        kintaiInfo.month, kintaiInfo.day,
                        Number(kintaiInfo.workTime.split(":")[0]),
                        Number(kintaiInfo.workTime.split(":")[1]))
                    let leavedDate = new Date(kintaiInfo.year,
                        kintaiInfo.month, kintaiInfo.day,
                        Number(kintaiInfo.leavedTime.split(":")[0]),
                        Number(kintaiInfo.leavedTime.split(":")[1]))
                    let diff = leavedDate - workedDate
                    let workingHour = (diff / (60 * 60 * 1000))
                    kintaiInfo.workingHour = workingHour - 1
                    requestKintaiPut(info)
                    return
                }
            }
        }

    }, () => {
        console.log("putKintai error")
    })
}

function updateKintai(yyyymmdd, work, leaved, breakHour) {

    requestKintaiGetAll((data) => {
        let info = kintaiInfoWith(data)
        if (isKintaiInfoEmpty(info)) {
            return
        }
        if (info["month"] === `${Number(yyyymmdd.split("-")[1])}月`) {
            let kintaiList = info["kintaiList"]
            if (isKintaiInfoEmpty(kintaiList)) {
                return
            }
            for (let j = 0; j < kintaiList.length; j++) {
                let kintaiInfo = kintaiList[j]
                if (kintaiInfo["day"] == `${Number(yyyymmdd.slice(-2))}`) {
                    let workedDate = new Date(kintaiInfo.year,
                        kintaiInfo.month, kintaiInfo.day,
                        Number(work.split(":")[0]),
                        Number(work.split(":")[1]))
                    let leavedDate = new Date(kintaiInfo.year,
                        kintaiInfo.month, kintaiInfo.day,
                        Number(leaved.split(":")[0]),
                        Number(leaved.split(":")[1]))
                    let breakHourNum = Number(breakHour.split(":")[0]) + (Number(breakHour.split(":")[1]) / 60)
                    let diff = leavedDate - workedDate
                    let workingHour = (diff / (60 * 60 * 1000))

                    kintaiInfo.workTime = work
                    kintaiInfo.leavedTime = leaved
                    kintaiInfo.breakTime = breakHour
                    kintaiInfo.workingHour = workingHour - breakHourNum

                    requestKintaiPut(info)
                    return
                }
            }
        }
    }, () => {
        console.log("updateKintai error")
    })
}

function deleteKintai(yyyymmdd) {
    requestKintaiGetAll((data) => {
        let info = kintaiInfoWith(data)
        if (info["month"] == `${Number(yyyymmdd.split("-")[1])}月`) {
            console.log("deleteKintai month")
            let kintaiList = info["kintaiList"]
            for (let j = 0; j < kintaiList.length; j++) {
                let kintaiInfo = kintaiList[j]
                if (kintaiInfo["day"] == `${Number(yyyymmdd.slice(-2))}`) {
                    kintaiList.splice(j, 1)
                    requestKintaiPut(info)
                    return
                }
            }
        }
    }, () => {
        console.log("deleteKintai error")
    })
}

// MARK:- UI Method

function updateUIWith(month) {
    // table row reset
    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild)
    }
    while (tFoot.firstChild) {
        tFoot.removeChild(tFoot.firstChild)
    }

    // TODO: 画面に保存してそれを使う

    console.log("updateUIWith onsuccess")
        // parse kintai data
    let totalWorkingHour = 0

    for (let i = 0; i < topKintai.length; i++) {
        let info = topKintai[i]
        console.log(`month is ${month}`)
        selectedMonth = month === undefined ? (thisMonth) : month
        if (info["month"] == `${selectedMonth}月`) {
            let selectedMonthKintaiList = info["kintaiList"]
            for (let i = 0; i < selectedMonthKintaiList.length; i++) {
                const selectedMonthKintaiInfo = selectedMonthKintaiList[i]

                // TODO: kintaiInfo全部渡すのいやだ。。
                createKintaiRow(selectedMonthKintaiInfo)
                totalWorkingHour += selectedMonthKintaiInfo.workingHour

                let selectedDate = yyyymmdd(selectedMonthKintaiInfo.year, selectedMonthKintaiInfo.month, selectedMonthKintaiInfo.day)
                settingDialog(selectedDate)

                console.log(`table row createElement ${i}`)
            }
        }
    }
    createKintaiListFotter(totalWorkingHour)
}

function createKintaiListFotter(totalWorkingHour) {
    // create total working hour
    const totalRow = document.createElement('tr')
    const totalWorkingHourLabel = document.createElement('td')
    const totalWorkingHourValue = document.createElement('td')
    const span = document.createElement('td')

    totalRow.appendChild(totalWorkingHourLabel)
    totalRow.appendChild(totalWorkingHourValue)
    totalRow.appendChild(span)
    tFoot.appendChild(totalRow)

    totalWorkingHourLabel.textContent = totalWorkingHourTitle
    totalWorkingHourValue.textContent = `${totalWorkingHour}h`
    totalWorkingHourLabel.setAttribute(`colspan`, `5`)
    totalWorkingHourValue.setAttribute(`class`, "table-footer-value")
    span.setAttribute(`rowspan`, `2`)

    // create diff workingHour row
    const minHour = 120
    const maxHour = 160
    let diffWorkingHour = 0

    const diffRow = document.createElement('tr')
    const difflWorkingHourLabel = document.createElement('td')
    const diffWorkingHourValue = document.createElement('td')

    diffRow.appendChild(difflWorkingHourLabel)
    diffRow.appendChild(diffWorkingHourValue)
    tFoot.appendChild(diffRow)

    difflWorkingHourLabel.textContent = diffWorkingHourTitle(minHour, maxHour)
    if (totalWorkingHour < minHour) {
        diffWorkingHour = `${minHour}hまであと${minHour - totalWorkingHour}h`
    } else if (totalWorkingHour < maxHour) {
        diffWorkingHour = `${minHour}hまであと${maxHour - totalWorkingHour}h`
    } else {
        diffWorkingHour = `契約時間超過中:+${totalWorkingHour - maxHour}h`
    }
    diffWorkingHourValue.textContent = diffWorkingHour
    difflWorkingHourLabel.setAttribute(`colspan`, `5`)
    diffWorkingHourValue.setAttribute(`class`, "table-footer-value")
}

function createKintaiRow(kintaiInfo) {
    const kintaiRow = document.createElement('tr')
    const currentDate = document.createElement('td')
    const dayOfWeek = document.createElement('td')
    const workTime = document.createElement('td')
    const leavedTime = document.createElement('td')
    const breakTime = document.createElement('td')
    const workingHour = document.createElement('td')
    const editButtonCell = document.createElement('td')
    const editButton = document.createElement('button')

    // TODO: モーダル要素取得気持ち悪い。。
    const inputdialog = document.querySelector("dialog")
    const modalDate = document.getElementById('modal-date')
    const modalWork = document.getElementById('modal-work')
    const modalLeaved = document.getElementById('modal-leaved')
    const modalBreak = document.getElementById('modal-break')

    editButton.setAttribute("class", "button-edit")
    editButton.setAttribute("id", "show")
    editButton.textContent = "編集"

    editButtonCell.appendChild(editButton)

    editButton.addEventListener('click', function() {
        modalDate.value = yyyymmdd(kintaiInfo.year, kintaiInfo.month, kintaiInfo.day)
        modalWork.value = zeroPadding(kintaiInfo.workTime)
        modalLeaved.value = zeroPadding(kintaiInfo.leavedTime)
        modalBreak.value = zeroPadding(kintaiInfo.breakTime)
        inputdialog.showModal()
    }, false)

    kintaiRow.appendChild(currentDate)
    kintaiRow.appendChild(dayOfWeek)
    kintaiRow.appendChild(workTime)
    kintaiRow.appendChild(leavedTime)
    kintaiRow.appendChild(breakTime)
    kintaiRow.appendChild(workingHour)
    kintaiRow.appendChild(editButtonCell)
    tBody.appendChild(kintaiRow)

    currentDate.textContent = `${kintaiInfo.month}/${kintaiInfo.day}`
    dayOfWeek.textContent = kintaiInfo.dayOfWeek
    workTime.textContent = zeroPadding(kintaiInfo.workTime)
    leavedTime.textContent = zeroPadding(kintaiInfo.leavedTime)
    breakTime.textContent = zeroPadding(kintaiInfo.breakTime)
    workingHour.textContent = kintaiInfo.workingHour
}

function settingDialog(yyyymmdd) {
    const inputdialog = document.querySelector("dialog")
    const dialogColoseButton = document.getElementById("close")
    const dialogUpdateButton = document.getElementById("update")
    const dialogDeleteButton = document.getElementById("delete")

    const modalDate = document.getElementById('modal-date')
    const modalWork = document.getElementById('modal-work')
    const modalLeaved = document.getElementById('modal-leaved')
    const modalBreak = document.getElementById('modal-break')

    dialogColoseButton.addEventListener('click', () => {
        inputdialog.close()
    }, false)

    dialogUpdateButton.addEventListener('click', () => {
        updateKintai(modalDate.value,
            modalWork.value,
            modalLeaved.value,
            modalBreak.value)
        inputdialog.close()
    }, false)

    dialogDeleteButton.addEventListener("click", () => {
        deleteKintai(yyyymmdd)
        inputdialog.close()
    }, false)
}