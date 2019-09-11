import './main-dir.html'

const TP = Template.main_dir;

const directory = {};
const directory_timeStamp = new ReactiveVar(0);

TP.onCreated(function(){
  Meteor.call('get-directory', (err, data) =>{
    if (err) throw Meteor.Error(err);
    //Session.set('web-pages',data.map(fn=>{return {fn}}))
    data.forEach(fn =>{
      console.log({fn})
      directory[fn] = new ReactiveVar();
    });
    console.log('directory:',directory)
    directory_timeStamp.set(new Date())
  })
})

TP.onRendered(function(){
})


TP.helpers({
  web_pages: ()=>{
    //return Session.get('web-pages')
    const ts = directory_timeStamp.get();
    // run ONCE.

    const data = Object.keys(directory).map(fn => {
//      const articles = Array.from(directory[fn].get());
      const articles = Array.from(directory[fn].get() || []);
      return {fn, articles}
    });
    return data;
  }
})


FlowRouter.route('/', { name: 'main-dir',
  action: function(params, queryParams){
    console.log('Router::action for: ', FlowRouter.getRouteName());
    console.log(' --- params:',params);
    document.title = "editora-v1";
    BlazeLayout.render('main_dir');
//    Session.set('article-id',null);
  }
});



Template.web_page.onCreated(function(){
  console.log(`Template.web_page.onCreated data:`,this.data);
  this.articles = new ReactiveVar();
});

Template.web_page.onRendered(function(){
  console.log(`Template.web_page.onRendered data:`,this.data);
});


Template.web_page.helpers({
  articles: ()=> {
    const articles = Template.instance().articles.get();
    console.log(`Template.web_page.articles:`,articles)
    if (articles) {
      return Object.values(articles)
    }
  }
})


Template.web_page.events({
  'click .js-get-articles': (e,tp)=>{
    e.preventDefault();
    const ae = e.currentTarget.closest('vbox[data-fn]');
    const fn = ae.dataset.fn;
    Meteor.call('get-articles', fn, (err, data) =>{
      if (err) throw err;
      console.log('get-articles =>data:',data)
      console.log('directory:',directory)
      // move data to directory;
      const articles = tp.articles.get() || {};
      console.log(`articles1:`, articles)
      data.forEach(it => {articles[it.id] = it});
      console.log(`articles2:`, articles)
      tp.articles.set(articles);
    })
//    return -1;
  }
})


Template.web_page.events({
  'click .js-edit-article': (e,tp)=>{
    e.preventDefault();
//    console.log('edit:', e)
//    console.log('edit tp.data:', tp.data)
//    const a = e.currentTarget.closest('.js-edit-article');
//    console.log(`a:`,a)
    const sku = e.currentTarget.dataset.sku;
    const article_id = e.currentTarget.dataset.id;

    console.log({article_id})
    console.log('tp.data.page.fn:',tp.data.page.fn)
    Session.set('web-page',tp.data.page.fn);
    FlowRouter.go(`/edit-article/${article_id}`) // could be in session also.
  }
})
