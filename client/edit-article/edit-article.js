const fs = require('fs')
const path = require('path')

import './edit-article.html'

const TP = Template.edit_article;



TP.onCreated(function(){
  /*
        get MD file associated with this article.
        Note: web_page fileName is Session.
  */
  const article_id = Session.get('article-id')
  const web_page = Session.get('web-page')
  const tp = this;

  const save_article = ()=>{
    return function(){
      console.log('HELLOOOOOOOOOOOOOOOOO')
      console.log('Here we should save the article and update the web-page.')
    }
  }

  tp.data.article = {article_id, web_page, save_article};
  console.log(`Template.edit_article.onCreated.data:`,tp.data)

  tp.text = new ReactiveVar()
  Meteor.call('get-article',{web_page,article_id},(err,data)=>{
    if (err) throw err;
    console.log({data}) // here is the raw-file content
    tp.text.set(data.text)
  })

  tp.save_article = ()=>{
    console.log(`save-article`)
    const article = tp.cm.getValue();
    Meteor.call('update-web-page',
      {web_page:Session.get('web-page'),article_id, update:true, article},
      (err,data)=>{
        if (err) throw err;
        console.log({data}) // here is the raw-file content
      })
  }
  //tp.data.save_article = tp.save_article;
})

TP.onRendered(function() {
  const tp = this;
  const cm_TextArea = this.find('#cm_TextArea'); //document.getElementById('myText');

  console.log({cm_TextArea})
  console.log(`Template.edit_article.onRendered.data:`,tp.data)
  // configure codeMirror for this app-key
  var cm = this.cm = CodeMirror.fromTextArea(cm_TextArea, {
//      mode: "javascript",
//      mode: "markdown",
      mode: "text/x-yaml",
      lineNumbers: true,
      viewportMargin:10,
      cursorScrollMargin: 5,
      lineWrapping: true,
      matchBrackets: true,
//      keyMap:'vim',
      keyMap:'sublime',
      viewportMargin:200, // ???
      extraKeys: {
        "Ctrl-S": tp.save_article,
//        "Ctrl-Right": next_article,
//        "Ctrl-Left": prev_article
      }
  });
  //  cm.save()
  $(".CodeMirror").css('font-size',"10pt");
  $(".CodeMirror").css('line-height',"24px");
  cm.setSize('100%', '100%');
  // json to yaml.

  //tp.cm.setValue(tp.text.get());


  cm.on("change", (cm, change)=>{ // transform MD -> Article -> html (preview)
    console.log({change});
    /*
    var Article = Meteor.publibase_article;
    const self = this;
//    this.ccount.set(this.ccount.get()+1);
    Session.set('cm-hitCount',1);

    // update a reactive variable.
    let s = cm.getValue();
    // here we should extract data to go in headline, or abstract
    Editora.md_code.set(s);
//    const p = Meteor.publibase_dataset.cc.markup_render_preview(s);
//    Meteor.publibase.article_html_preview.set(p);
  */
    return false; // ??
  });

  /*************************
    IMMEDIATE RESET
  *************************/

  Tracker.autorun(function(){
    const text = tp.text.get();
    if (!text) return;
    tp.cm.setValue(tp.text.get());
  })


}) // on Rendered



TP.helpers({
  text: ()=>{
    return Template.instance().text.get();
  }
})

FlowRouter.route('/edit-article/:article_id', { name: 'edit-article',
  triggerEnter: [
    function(context, redirect) {
      const web_page = Session.get('web-page');
      console.log(`triggerEnter web_page:`,Session.get('web-page'))
      if (!web_page) redirect('/')
    }
  ],
  action: function(params, queryParams){
    console.log('Router::action for: ', FlowRouter.getRouteName());
    console.log(' --- params:',params);
    document.title = "editora-v1";
    const web_page = Session.get('web-page');
    if (!web_page) {
      FlowRouter.go('/')
      return;
    }
    Session.set('article-id',params.article_id)
    console.log(`html-page already set:`,Session.get('web-page'))
    BlazeLayout.render('edit_article',params);
  }
});
