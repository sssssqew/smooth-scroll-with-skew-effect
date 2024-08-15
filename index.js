let current = 0
let target = 0
let ease = 0.03 // 값이 작을수록 더 부드럽게 스크롤됨

let windowWidth, containerHeight, imageHeight, skewDiff 

let container = document.querySelector('.container')
let images = Array.from(document.querySelectorAll('.img_wrap')) // 실제 이미지가 들어가는 요소

images.forEach((image, idx) => {
    image.style.backgroundImage = `url(./imgs/img-${idx+1}.jpg)`
})

function lerp(start, end, t){
    return start * (1 - t) + end * t
}

function setTransform(el, transform){
    el.style.transform = transform 
}

// containerHeight (컨텐츠 높이) : 2500px 
// windowWidth (디바이스 너비)가 760px 보다 크면 사진은 두줄로 나열되므로 행은 4개이고, 그래서 컨텐츠 높이를 4(8 / 2)로 나눠주면 하나의 이미지 높이가 나옴
// windowWidth (디바이스 너비)가 760px 보다 작으면 사진은 한줄로 나열되므로 행은 8개이고, 그래서 컨텐츠 높이를 8로 나눠주면 이미지 하나의 높이가 나옴
function setupAnimation(){
    windowWidth = window.innerWidth 
    containerHeight = container.getBoundingClientRect().height 
    imageHeight = containerHeight / (windowWidth > 760 ? images.length / 2 : images.length)
    document.body.style.height = `${containerHeight}px` // 컨텐츠 높이만큼 스크롤바 생성
    smoothScroll()
}

function smoothScroll(){
    current = lerp(current, target, ease)
    current = parseFloat(current.toFixed(2)) // current 는 소수점이 길어지면 애니메이션 성능이 저하되므로 소수점을 잘라서 성능향상을 기대함
    target = window.scrollY 
    // skewDiff : 값이 클수록 왜곡이 심함
    skewDiff = (target - current) * .015 // 목표지점(target)과 현재 스크롤위치(current) 와의 차이 (15% 비율) / 스크롤을 시작할때는 y축으로 사진이 많이 왜곡되다가 스크롤이 끝날때쯤에는 차이가 거의 0이므로 왜곡이 사라지고 원본 사진으로 돌아감

    setTransform(container, `translateY(${-current}px) skewY(${skewDiff}deg)`)
    updateImages()
    requestAnimationFrame(smoothScroll)
}

// intersectionRatioValue : 이미지 스크롤해서 브라우저 화면에 보이지 않는 것들은 해당값이 0보다 크다
// 반면에 아직 브라우저 화면에 보이는 이미지들은 해당값이 0보다 작거나 같다
function updateImages(){
    // ratio : 이미지 높이 대비 몇개의 이미지 행을 스크롤했는지 의미함 (0부터 시작해서 계속 커지는 값)
    // current 는 스크롤한 높이이고, imageHeight 은 한 행의 높이므로 스크롤한 높이가 이미지높이의 몇배인지에 대한 값
    // 만약 이미지 두행을 스크롤했으면 ratio 는 2이고, 이미지 3개의 행을 스크롤했으면 ratio 는 3이다 
    
    // 스크롤을 아래로 내린 경우에 해당함 (위로 올린 경우는 반대로 됨)
    // intersectionRatioIndex : 사진이 몇번째 행인지 (0부터 시작해서 0, 1, 2, 3)
    // intersectionRatioValue : 첫번째행(intersectionRatioIndex = 0)은 ratio가 0부터 점점 커지므로 해당값이 (0 - 0) 계속 양수이고 점점 커짐
    // intersectionRatioValue : 두번째행(intersectionRatioIndex = 1)은 ratio가 0부터 점점 커지므로 해당값은 (0 - 1) 즉, -1부터 시작해서 점점 0에 가까워지다가 0을 지나 양수가 되고 점점 커짐
    // intersectionRatioValue : 세번째행(intersectionRatioIndex = 2)은 ratio가 0부터 점점 커지므로 해당값은 (0 - 2) 즉, -2부터 시작해서 점점 0에 가까워지다가 0을 지나 양수가 되고 점점 커짐
    // intersectionRatioValue : 네번째행(intersectionRatioIndex = 3)은 ratio가 0부터 점점 커지므로 해당값은 (0 - 3) 즉, -3부터 시작해서 점점 0에 가까워지다가 0을 지나 양수가 되고 점점 커짐
    // setTransform(image, `translateY(${intersectionRatioValue * 70}px)`) : 해당코드는 intersectionRatioValue 값이 음수에서 시작해서 양수로 변하므로 이미지 자체가 점점 아래로 내려옴 (이미지 위쪽이 서서히 드러남) 
    
    // intersectionRatioValue = ratio - intersectionRatioIndex
    // 결국 위 코드의 의미(intersectionRatioValue)는 빼주는 intersectionRatioIndex 기준으로 ratio 값이 해당 intersectionRatioIndex 기준보다 작은지 큰지 판단하는 값이다
    // ratio 가 기준(intersectionRatioIndex) 보다 작으면 intersectionRatioValue 는 음수이고, 기준보다 크면 intersectionRatioValue 는 양수가 된다 
    let ratio = current / imageHeight 
    let intersectionRatioIndex, intersectionRatioValue
    
    images.forEach((image, idx) => {
        intersectionRatioIndex = windowWidth > 760 ? parseInt(idx / 2) : idx 
        intersectionRatioValue = ratio - intersectionRatioIndex
        // if(idx === 1) console.log(ratio, intersectionRatioIndex, intersectionRatioValue)
        setTransform(image, `translateY(${intersectionRatioValue * 70}px)`)
    })
}

setupAnimation()