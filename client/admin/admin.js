import riot from 'riot';

import './admin.html'

console.log({riot})
//import HelloWorld from './HelloWorld.tag'
//riot.mount('*')

const TP = Template.admin;

TP.events({
  'submit form': (e,tp)=>{
    e.preventDefault();
    console.log(`submit =>`,e.target)
    console.log(`submit => fmt:`,e.target.fmt.value)
    console.log(`submit => article-id:`,e.target['article-id'].value)
  }
})


FlowRouter.route('/admin', { name: 'admin',
  action: function(params, queryParams){
    console.log('Router::action for: ', FlowRouter.getRouteName());
    console.log(' --- params:',params);
    document.title = "editora-v1";
    BlazeLayout.render('admin');
//    Session.set('article-id',null);
  }
});
