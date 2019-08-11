
/* Ratslider v1.0.0
 * By Rantasma
 * Github: https://github.com/rantasma/ratslider
 */
class RatsliderCore{
	constructor(props,onChange,set,reset,get){
		this.props=props;

		this.set=set
		this.reset=reset;
		this.get=get
		this.onChange=onChange;

		this.slidesLength=document.querySelectorAll(props.slides).length;
		this.sliderId=`${props.id}`;
		this.setCurrentSlide(0);

	}
	setCurrentSlide(index,goto=false){
		var max=this.getSliderLength();
		if (!goto) {
			index=index==0?0:index==max?max-1:index-1;
		}
		if(typeof this.set == 'function'){
			this.set(this.getSlides()[index],index)
		}else{
			this.getSlides()[index].className+=` current`;
		}
	}
	resetCurrentSlide(){
		if(typeof this.reset == 'function'){
			this.reset(this.getCurrentSlide(),this.getNodeIndex(this.getCurrentSlide()))
		}else{
			let regex=new RegExp('current','g')
			let current=this.getCurrentSlide()
			current.className=current.className.replace(regex,'')
		}
	}
	getCurrentSlide(){
		if(typeof this.get == 'function'){
			return this.get()
		}else{
			return document.querySelector(`${this.sliderId} .current`);
		}
	}
	getCurrentSlideIndex(){
		return this.getNodeIndex(this.getCurrentSlide());
	}
	getSlides(){
		return document.querySelectorAll(`${this.sliderId} ${this.props.slides}`);
	}
	getSliderLength(){
		return this.getSlides().length
	}
	getNodeIndex(element){
		var arr=Array.from(this.getSlides())
		return arr.indexOf(element)+1

	}
	getMetadata(){
		return{
			container:document.querySelector(this.sliderId),
			id:this.sliderId,
			slidesClass:this.props.slides
		}
	}
	next(callback){
		var currentElement=this.getCurrentSlide()
		var currentIndex=this.getCurrentSlideIndex()
		var slides=this.getSlides()
		var slidesLength=this.getSliderLength();

		this.resetCurrentSlide();
		if (currentIndex == slidesLength) {
			this.setCurrentSlide(0);
			typeof callback=='function'?callback(
				currentElement,
				slides[0],
				slides[1]
			):null;
		}else{
			this.setCurrentSlide(currentIndex+1)
			typeof callback=='function'?callback(
				currentElement,
				slides[currentIndex],
				currentIndex==slidesLength-1?slides[0] : slides[(currentIndex+1)]
			):null;
		}
		typeof this.onChange=='function'?this.onChange(
			slides[currentIndex],
			currentIndex==slidesLength?0:currentIndex,
			slides
		):null;
	}
	prev(callback){
		var slides=this.getSlides()
		var slidesLength=this.getSliderLength();
		var currentElement=this.getCurrentSlide()
		var currentIndex=this.getCurrentSlideIndex();

		this.resetCurrentSlide();
		if (currentIndex == 1	) {
			this.setCurrentSlide(slidesLength)
			callback(
				slides[0],//prev
				slides[slidesLength-1],//current
				currentElement//next
			)
		}else{
			this.setCurrentSlide(currentIndex-1)
			callback(
				currentIndex==1?slides[slidesLength-1] : slides[currentIndex-2],
				slides[currentIndex-2],
				currentElement
			)
		}
		typeof this.onChange=='function'?this.onChange(
			slides[currentIndex],
			currentIndex==1?slidesLength-1:currentIndex-2,
			slides
		):null;
	}
	goTo(to,callback){
		var slides=this.getSlides();
		var slidesLength=this.getSliderLength();
		var currentElement=this.getCurrentSlide()
		var currentIndex=this.getCurrentSlideIndex()

		if (to >= 0 && to < slidesLength && to!= currentIndex-1 ) {
			this.resetCurrentSlide()
			this.setCurrentSlide(to,true)
			typeof callback=='function'? callback(
				slides[currentIndex-1],
				slides[to],
				slides[to>slidesLength?to:0]
			):null;
			typeof this.onChange=='function'?this.onChange(slides[to],to,slides):null;
		}
	}
}

class Ratslider extends RatsliderCore{
	constructor(props,animationEnd){
		super({
				id:props.id,
				slides:props.slides,
			},
			onChange,
			setCurrentSlide,
			resetCurrentSlide,
			getCurrentSlide
		);


		function setCurrentSlide(element,index){
			element.setAttribute('ratslider','current-slide')
		}
		function resetCurrentSlide(element,index){
			element.setAttribute('ratslider','slide')
		}

		function getCurrentSlide(){
			return document.querySelector(`${props.id} [ratslider*=current-slide]`)
		}

		function onChange(element,index,slides){
			var dots=document.querySelectorAll(`${props.id}[ratslider=container] .dotHandler span`)
			for (var i = 0; i < dots.length; i++) {
				dots[i].className=''
			}
			dots[index].className=`ratslider-dot-active`
		}

		// set global constants
		this.props=props;
		this.metadata=super.getMetadata()
		this.containerElement=this.metadata.container
		this.containerSelector='#'+this.containerElement.getAttribute('id')
		this.prefix='ratslider'
		this.defaultAttr='slide';
		this.currentSlideAttr='current-slide'
		this.containerAttr='container'
		this.nextSlideAttr='reverse-slide'
		this.prevSlideAttr='foward-slide'

		// tagg all the slider
		this.setAttribute(this.containerElement,this.containerAttr)
		super.getSlides().forEach((slide)=>{
			if (slide.getAttribute(this.prefix) != this.currentSlideAttr) {
				this.setAttribute(slide,this.defaultAttr)
			}
			slide.addEventListener("animationend",(a)=>{
				a.animationName=='in-reverse'||a.animationName=='in-foward'? typeof animationEnd=='function'?animationEnd(a):null:null;
			}, false);
		})


		if (props.dots) {
			this.dots()
			document.querySelector(`${props.id}[ratslider=container] .dotHandler span`).className='ratslider-dot-active'
		}
		if (props.handlers) {
			this.handlers()
		}
		if (props.draggable) {
			if (typeof draggable == 'object') {
				var op=prps.draggable
				drag(op.timeDragging,op.mobileDistance,op.desktopDistance)
			}else{
				this.drag()
			}
		}
	}
	setAttribute(selector,value){
		if (typeof selector=='object') {
			selector.setAttribute(this.prefix,value)
		}else{
			var containerSelector=this.containerSelector+' ';
			document.querySelector(containerSelector + selector).setAttribute(this.prefix,value)
		}
	}
	cleanAttributes(){
		this.getSlides().forEach((slide)=>{
			var attr=slide.getAttribute(this.prefix)
			if (attr==this.nextSlideAttr ) {
				this.setAttribute(slide,this.defaultAttr)
			}
			if(attr == this.prevSlideAttr){
				this.setAttribute(slide,this.defaultAttr)
			}
		})
	}
	drag(timeDragging=200,mobileDistance=200,desktopDistance=100){
		var pos={}

		this.getSlides().forEach((slide)=>{
			slide.addEventListener('mousedown',(e)=>{
				pos.init=e.clientX
			})
			slide.addEventListener('mouseup',(e)=>{
					pos.end=e.clientX
					if (pos.init<pos.end-desktopDistance) {
						this.prev()
					}else if(pos.init>pos.end+desktopDistance){
						this.next()
					}
			})

			slide.addEventListener('touchstart',(e)=>{
				pos.init=e.touches[0].clientX
			})
			slide.addEventListener('touchmove',(e)=>{
				pos.end=e.touches[0].clientX
			})
			slide.addEventListener('touchend',(e)=>{
					if (pos.init<pos.end-mobileDistance) {
						this.prev()
					}else if(pos.init>pos.end+mobileDistance){
						this.next()
					}
				pos.init=0;
				pos.end=0;
				this.dragValidator=false
			})
		})
	}
	next(callback){
		super.next((prev,current,next)=>{
			this.cleanAttributes()
			this.setAttribute(current,`${this.currentSlideAttr}-${this.nextSlideAttr}`)
			this.setAttribute(prev,this.nextSlideAttr)
			typeof callback=='function'?callback(prev,current,next):null;
		})
	}
	prev(callback){
		super.prev((prev,current,next)=>{
			this.cleanAttributes()
			this.setAttribute(current,`${this.currentSlideAttr}-${this.prevSlideAttr}`)
			this.setAttribute(next,this.prevSlideAttr)
			typeof callback=='function'?callback(prev,current,next):null;
		});
	}
	goTo(index,callback){
		super.goTo(index,
			(prev,current,next)=>{
				this.cleanAttributes();
				if (Number(index)+1>this.getNodeIndex(prev)) {
					this.setAttribute(current,`${this.currentSlideAttr}-${this.nextSlideAttr}`)
					this.setAttribute(prev,this.nextSlideAttr)
				}else{
					this.setAttribute(current,`${this.currentSlideAttr}-${this.prevSlideAttr}`)
					this.setAttribute(prev,this.prevSlideAttr)
				}
				typeof callback=='function'?callback(prev,current,next):null;
			}
		)
	}
	handlers(){
		var right=document.createElement("span")
		right.innerHTML="&#10097;"
		right.className='next handler'

		var left=document.createElement("span")
		left.innerHTML="&#10096;"
		left.setAttribute('id', `prev`);
		left.className='prev handler'

		this.containerElement.insertBefore(left,this.containerElement.firstElementChild)
		this.containerElement.appendChild(right)

		document.querySelector(`${this.containerSelector} span.prev.handler`).addEventListener('click',(e)=>{
			this.prev();
		})
		document.querySelector(`${this.props.id} .next.handler`).addEventListener('click',(e)=>{
			this.next();
		})
	}
	dots(){
		var dotContainer=document.createElement('div')
		dotContainer.className='dotHandler'
		this.containerElement.appendChild(dotContainer)
		for (var i = 0; i < document.querySelectorAll(this.props.slides).length; i++) {
			var dot=document.createElement('span')
			dot.setAttribute('slide',i);
			dotContainer.appendChild(dot)

			dot.addEventListener('click',(e)=>{
				var index=e.target.getAttribute('slide')
				this.goTo(index)
			})
		}
	}
}
