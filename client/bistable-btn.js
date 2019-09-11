import './bistable-btn.html'
const TP = Template.bistable;

TP.onCreated(function(){
  console.log(`Template.bistable.onCreated data:`,this.data)
  this.q = new ReactiveVar(false);
})

TP.onRendered(function(){
  console.log(`Template.bistable.onRendered data:`,this.data)
  const div = this.find("div.bistable-btn")
  this.q.set(this.data.q);
//  if (this.data.q) div.classList.add('on')
//  else div.classList.remove('on')
})

TP.events({
  'click': (e,tp)=>{ // flip-flop
    console.log(`Template.bistable.click data:`,tp.data)
    tp.q.set(!tp.q.get());
    tp.data.onClick()
    return -1;
  }
})

TP.helpers({
  caption: ()=>{
    const tp = Template.instance();
    return (tp.q.get())?tp.data.on:tp.data.off;
  }
})
