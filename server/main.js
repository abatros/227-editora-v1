import { Meteor } from 'meteor/meteor';

const fs = require("fs");
const path = require('path')
const assert = require('assert');
const cheerio = require('cheerio');
const md2html = require('./md2html.js')

console.log(`process.env.METEOR_SETTINGS:`, process.env.METEOR_SETTINGS);
const meteor_settings = process.env.METEOR_SETTINGS && JSON.parse(process.env.METEOR_SETTINGS);
console.log(`public_settings(init):`,meteor_settings);

const root_folder = (meteor_settings && meteor_settings.public && meteor_settings.public.root_folder) || '/home/dkz/tmp/';

const web_pages = `
224-co.th/www/new-index.html
eglogics/design.eglogics.website/ultimheat/en/products.html
`.split(/[\n]+/g).map(it => it.trim()).filter(it => (it.length>0));


console.log(web_pages)

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  'get-directory': () =>{
    console.log(`process.env:`,process.env);
    console.log(`root-folder:`,root_folder);
    return web_pages;
  },
  'get-articles': (fn) =>{
    console.log(`scan file <${fn}> for articles:`);
    fn = path.join(root_folder,fn)
    console.log(`scan file <${fn}> for articles:`);
    const articles = scan_web_page_sku(fn)
    return articles;
  },
  'get-article': (cmd) =>{
    let {web_page:fpath, article_id} = cmd

    return new Promise((resolve, reject)=>{
      fpath_md = path.join(root_folder, fpath.replace(/\.html$/,''), article_id+'.md')
      console.log(`fpath_md:`,fpath_md)

      if (!fs.existsSync(fpath_md)) {
        console.log(`NOT FOUND article fpath:`,fpath_md)
        // get the html code
        fpath = path.join(root_folder, fpath)
        const html = seek_inner_html({fpath, article_id}).replace(/\n\s+/g,'\n')
        console.log('MD file-not-found, but we have HTML')
        resolve({
          text: `---\narticle_id: ${article_id}\nfmt: html\n---\n`+html,
          fpath,
          retCode: 'missing-md'
        })
      }
      const article = fs.readFileSync(fpath_md,'utf8');
      console.log('page.length:', article.length)

      resolve({fpath, text:article});
      /*
      const article = fs.readFileSync(web_page,'utf8');
      console.log('page.length:', page.length)
      const $ = cheerio.load(page)
      const section = $('section#tests-ya');
      console.log(`found ${section.length} sections.`)
      assert(section.length ==1)
    //      replace_product({sku, section, html});
      const v = $(section).find(`article[sku]`);
      const articles = [];
      v.each((j,a) =>{
        const {type, name, attribs} = a;
        console.log(`-------------------------\n`,attribs)
        articles.push({type, name, sku:attribs.sku})
      })
      resolve(articles);
      */
    })
  },
  'update-web-page': (cmd) =>{
    const {web_page} = cmd;
    let {fpath, article_id, article} = cmd;
    fpath = path.join(root_folder, fpath || web_page)
    console.log('update-web-page:', cmd)
    assert(fpath);

    return new Promise((resolve, reject)=>{
      console.log(`entering promise fpath:`,fpath)
      if (!fs.existsSync(fpath)) {
        console.log(`entering promise fpath not found.:`,fpath)
//        throw Meteor.Error(`file <${fpath}> not found`)
        reject(`fpath <${fpath}> invalid`)
      }
      const fpath_md = path.join(fpath.replace(/\.html$/,''), article_id+'.md')
      fs.writeFileSync(fpath_md, article,'utf8');
      console.log(`fs.writeFileSync1 fpath_md:`,fpath_md)
      // here MD file saved.

      const {article_id:sku2, html} = md2html(article); // if raw-html yaml not used.
      console.log(`html:`,html)
      try {
        console.log(`calling update_web_page w/fpath:`,fpath)
          update_web_page({fpath, article_id, article:html});
          console.log(`return from update_web_page w/fpath:`,fpath)
      }
      catch(err) {
        reject(err)
      }
      resolve(html.sku)
    })
  }
})

/*
      looks for <article id="XXX">...</article>
*/


function scan_web_page_id(web_page) {
  return new Promise((resolve, reject)=>{
    const page = fs.readFileSync(web_page,'utf8');
    console.log('page.length:', page.length)
    const $ = cheerio.load(page)
    /*
    const section = $('section#tests-ya');
    console.log(`found ${section.length} sections.`)
    assert(section.length ==1)
  //      replace_product({sku, section, html});
    const v = $(section).find(`article[sku]`);
    */

    const v = $('body').find(`article[id]`);
    const articles = [];
    v.each((j,a) =>{
      const {type, name, attribs} = a;
      console.log(`-------------------------\n`,attribs)
      articles.push({type, name, id:attribs.id})
    })
    resolve(articles);
  })
}

function scan_web_page_sku(web_page) {
  return new Promise((resolve, reject)=>{
    const page = fs.readFileSync(web_page,'utf8');
    console.log('page.length:', page.length)
    const $ = cheerio.load(page)
    /*
    const section = $('section#tests-ya');
    console.log(`found ${section.length} sections.`)
    assert(section.length ==1)
  //      replace_product({sku, section, html});
    const v = $(section).find(`article[sku]`);
    */

    const v = $('body').find(`article[data-sku]`);
    console.log(`found ${v.length} article[data-sku]`)
    const articles = [];
    v.each((j,a) =>{
      const {type, name, attribs} = a;
//      console.log(`-------------------------\n`,$(a).data('sku'))
//      console.log(`-------------------------\ndataset:`,a.dataset)
      articles.push({type, name, id:$(a).data('sku')})
    })
    resolve(articles);
  })
}

/*
    open html-file, locate <article>, get inner-html.
    return an array of html-elements
*/

function seek_inner_html(o) {
  let {fpath, article_id} =o;
  console.log(`get_html(file:${fpath}, article-id:${article_id})`);
  const page_html = fs.readFileSync(fpath,'utf8');
  console.log('page.length:', page_html.length)
  const $ = cheerio.load(page_html)
  let v =null;
  if (true) {
    v = $('body').find(`article[data-sku=${article_id}]`);
    console.log(`found ${v.length} article: sku=${article_id}`)
  } else {
    v = $('body').find(`article[id="${article_id}"]`);
    console.log(`found ${v.length} article: id=${article_id}`)
  }
  if (v.length <=0) {
    console.log(`This product ${article_id} is not found in blue-section.`)
    return
  }
  // Get inner-html
  const html = v.html();
  console.log(`data():`,v.data())
  console.log(`data('sku'):`,v.data('sku'))
  console.log(`inner-html:`,html)
  return html
}


function seek_article_replace(o) {
  let {fpath, article_id} =o;
  console.log(`get_html(fpath:${fpath}, article-id:${article_id})`);
  const page_html = fs.readFileSync(fpath,'utf8');
  console.log('page.length:', page_html.length)
  const $ = cheerio.load(page_html)
  let v =null;
  if (true) {
    v = $('body').find(`article[data-sku=${article_id}]`);
    console.log(`found ${v.length} article: sku=${article_id}`)
  } else {
    v = $('body').find(`article[id="${article_id}"]`);
    console.log(`found ${v.length} article: id=${article_id}`)
  }
  if (v.length <=0) {
    console.log(`This product ${article_id} is not found in blue-section.`)
    return
  }
  return v;
}


function update_web_page(o) {
  let {fpath, article_id, article} =o;
  console.log('update_web_page:',{o})
//  web_page = path.join(root_folder, web_page+'.html')

const page = fs.readFileSync(fpath,'utf8');
console.log('page.length:', page.length)
const $ = cheerio.load(page)
let v =null;
if (true) {
  v = $('body').find(`article[data-sku=${article_id}]`);
  console.log(`found ${v.length} article: sku=${article_id}`)
} else {
  v = $('body').find(`article[id="${article_id}"]`);
  console.log(`found ${v.length} article: id=${article_id}`)
}
if (v.length <=0) {
  console.log(`This product ${article_id} is not found in blue-section.`)
  return
}


  /*
  const page = fs.readFileSync(web_page,'utf8');
  console.log('page.length:', page.length)
  const $ = cheerio.load(page)
  const v = $('body').find(`article[id="${article_id}"]`);
  console.log(`found ${v.length} article: id=${article_id}`)
  if (v.length <=0) {
    console.log(`This product ${sku} is not found in blue-section.`)
    return
  }
  console.log(`new-html.length:`,html.length)
  */

  console.log(`replaced article.length:`,article.length)

  v.empty().append(article);

  const output = $.html()
  fs.writeFileSync(fpath, output, 'utf8');
  console.log(`fs.writeFileSync done w/fpath:`,fpath)
}
