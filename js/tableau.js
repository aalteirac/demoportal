;(function(window, undefined) {
  var viz, widget, edit, curmarks,isEditLoaded=false;
  var selectMarks=[];
  var editHeight="calc(100% - 26.5px)";
  var askHeight="calc(100% - 91px)";
  var dashHeight="91vh";
  const DS_NAME="SuperstoreDatasource";
  const VIEW_PATH="https://eu-west-1a.online.tableau.com/t/alteirac/views/Superstore/Overview";
  const WIDGET_PATH="https://eu-west-1a.online.tableau.com/t/alteirac/views/Superstore/Widget";
  const FIELD_ACTION="State";

  $( window ).resize(function() {
    resizeElements();
  });

  function resizeElements(){
    if(isEditLoaded==true)
      edit.setFrameSize($("#main").outerWidth(), $("#main").outerHeight()-27);
  }

  function loadVizInit() {
    urlView=`${VIEW_PATH}?:embed=y&render=true`;
    placeholderView = document.getElementById("tableauVizi");
    var optView = {
      onFirstInteractive: function () {
        preloadEdit();
        preloadAsk();
        enableDashFeature();
        listenToMarksSelection();
        $(".dash").addClass("navi");
      },
      device:mobileCheck()?'phone':'default',
      width: "100%",
      height: dashHeight,
      hideTabs: true,
      hideToolbar: true,
    };
    loadViz(placeholderView, urlView, optView);
    loadWidget();
  }

  function loadWidget() {
    urlWidget=`${WIDGET_PATH}?:embed=y&render=true`;
    placeholderWidget = document.getElementById("widget");
    var optWidget = {
      onFirstInteractive: function () {
       $(".tab-widget").css("opacity","1")
      },
      width: "99%",
      height: "200px",
      hideTabs: true,
      hideToolbar: true,
    };
    if (widget) {
      widget.dispose();
    }
    widget = new tableau.Viz(placeholderWidget, urlWidget, optWidget);
  } 

  function loadViz(placeholderDiv, url, options) {
    if (viz) {
      viz.dispose();
    }
    viz = new tableau.Viz(placeholderDiv, url, options);
  }

  function showMarks(){
    $("#listartefact").empty();
    if(!$(".action").hasClass("disabled")){
      for (var markIndex = 0; markIndex < curmarks.length; markIndex++) {
        var pairs = curmarks[markIndex].getPairs();
        for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
            var pair = pairs[pairIndex];
            var ele=
            `<div class="row">
              <div class="col">
                <label for="staticDim" class="col-form-label">${pair.fieldName} ${pair.formattedValue}</label>
              </div>
              <div class="col">
                <select class="form-control-sm">
                  <option>Send Congratulations to Managers</option>
                  <option>Send Reprimands to Managers</option>
                  <option>Call Mummy</option>
                </select>
              </div>
            </div>`
            if(pair.fieldName===FIELD_ACTION)
              $('#listartefact').append(ele);
        }
      }
      $('#modalMgt').modal('toggle')
    }
  }

  function listenToMarksSelection() {
    viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);
  }

  function onMarksSelection(marksEvent) {
      return marksEvent.getMarksAsync().then(reportSelectedMarks);
  }

  function reportSelectedMarks(marks) {
    curmarks=marks;
    if(curmarks.length>0){
      $(".action").removeClass("disabled");
    }
    else{
      $(".action").addClass("disabled");
    }
    selectMarks=[];
    for (var markIndex = 0; markIndex < curmarks.length; markIndex++) {
      var pairs = curmarks[markIndex].getPairs();
      for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
          var pair = pairs[pairIndex]; 
          if(pair.fieldName===FIELD_ACTION)
            selectMarks.push(pair.formattedValue)
      }
    }
    //console.log("["+selectMarks.join(",")+"]");
    filterWidget('State',selectMarks);
  }

  function preloadEdit(){
    if(edit)
        edit.dispose()
      var placeholderEdit = document.getElementById("tableauEdit");
      viz.getCurrentUrlAsync().then(function (current_url) {
        edit_url = current_url.split("?")[0].replace("/views", "/authoring");
        edit_options = {
          width: "100%",
          height: editHeight,
          onFirstInteractive: function () {
            isEditLoaded=true;
            var iframe = $("#tableauEdit iframe")[0];
            $(".edit").removeClass("disabled");
            $(".edit").removeClass("loading");
            $(".edit").addClass("navi");
            iframe.onload = function () {
              setTimeout(() => {
                preloadEdit();
              }, 500);
            };
          },
        };
        edit=new tableau.Viz(placeholderEdit, edit_url, edit_options);
      });
  }

  function preloadAsk(){
    viz.getCurrentUrlAsync().then(function (current_url) {
      var ask_url = `${current_url.split("views")[0]}askData/${DS_NAME}`;
      $("#tableauAsk iframe").on("load", function() {
        $(".ask").removeClass("disabled");
        $(".ask").removeClass("loading");
        $(".ask").addClass("navi");
        isAskLoaded=true;
      })
      $("#tableauAsk iframe")[0].contentWindow.location=ask_url;
      $("#tableauAsk iframe")[0].style.height=askHeight;
    })
  }

  function enableDashFeature(){
      $(".dashfeat").removeClass("disabled");
      if(curmarks && curmarks.length>0){
        $(".action").removeClass("disabled");
      }
  }

  function disableDashFeature(){
    $(".dashfeat").addClass("disabled");
    $(".action").addClass("disabled");
  }

  function goDash(){
    if(!$(".dash").hasClass("disabled")){
      enableDashFeature();
      $(".bread").text("/ Dashboard / Main");
      $(".dash").addClass("disabled");
      $(".edit").removeClass("disabled");
      $(".ask").removeClass("disabled");
      $("#myCarousel").carousel(0);
      $("#myCarousel").carousel("pause");
    }
  }

  function goEdit(){
    if(!$(".edit").hasClass("disabled")){
      disableDashFeature();
      $(".bread").text("/ Dashboard / Edit");
      $(".edit").addClass("disabled");
      $(".dash").removeClass("disabled");
      $(".ask").removeClass("disabled");
      $("#myCarousel").carousel(1);
      $("#myCarousel").carousel("pause");
      resizeElements();
    }
  }

  function goAsk(){
    if(!$(".ask").hasClass("disabled")){
      disableDashFeature();
      $(".bread").text("/ Dashboard / Ask");
      $(".ask").addClass("disabled");
      $(".dash").removeClass("disabled");
      $(".edit").removeClass("disabled");
      $("#myCarousel").carousel(2);
      $("#myCarousel").carousel("pause");
    }
  }

  function goExport(){
    if(!$(".export").hasClass("disabled")){
      viz.showExportPowerPointDialog();
    }
  }

  function goViews(){
    if(!$(".views").hasClass("disabled")){
      viz.showCustomViewsDialog();
    }
  }

  function filterWidget(filterName,value){
    var wid = widget.getWorkbook().getActiveSheet();
    if(value.length==0){
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.ALL)
      $(".profilt").text(`Profit per Month`)
    }
    else{
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.REPLACE)
      if(value.length==1)
        $(".profilt").text(`Profit (${value[0]})`)
      else{
        $(".profilt").text(`Profit (${value.length} States)`)
      }  
    }
  }

  function filter(ev,filterName,value){
    // viz.getWorkbook().getActiveSheet().getWorksheets().map((s)=>{
      // widget.getWorkbook().getActiveSheet().getFiltersAsync().then(function(filters){
      //   filters.map((f)=>{
      //     console.log("FILTER",f)
      //   })
      // })
    // })
    var sheet = viz.getWorkbook().getActiveSheet().getWorksheets()[0];
    var wid = widget.getWorkbook().getActiveSheet();
    if(ev!=null && $(ev).hasClass("pressed")){
      sheet.applyFilterAsync(filterName, value, tableau.FilterUpdateType.ALL).then(()=>{
        $(ev).removeClass("pressed");
        $(".profilt").text(`Profit per Month`)
      });
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.ALL)
    }
    else{
      sheet.applyFilterAsync(filterName, value, tableau.FilterUpdateType.REPLACE).then(()=>{
        $(".filt").removeClass("pressed");
        $(ev).addClass("pressed");
        $(".profilt").text(`Profit (${value})`)
      });
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.REPLACE)
    }  
  }

  function toggleMenu(){
    if($("#main").hasClass("collapsed")){
      $(".tab-widget").css("opacity","0.01")
      loadWidget();
      $(".collapsable").removeClass("collapsed");
    }
    else{
      $(".collapsable").addClass("collapsed");
    }
    resizeElements();
  }

  function intro(){
    var it=introJs();
    it.setOptions({
      showBullets: false,
      showProgress: true,
      showStepNumbers: false,
      keyboardNavigation: true,
      highlightClass:"myhighlight"
    });
    it.onafterchange(function(targetElement) {
      if($(targetElement).hasClass("tab-widget")){
        $(".myhighlight").addClass("low");
      }
      else{
        $(".myhighlight").removeClass("low");
      }

    });
    it.start();
  }
  window.tabportal={};
  window.tabportal.intro=intro;
  window.tabportal.showMarks=showMarks;
  window.tabportal.toggleMenu=toggleMenu;
  window.tabportal.loadVizInit=loadVizInit;
  window.tabportal.goDash=goDash;
  window.tabportal.goEdit=goEdit;
  window.tabportal.goAsk=goAsk;
  window.tabportal.goExport=goExport;
  window.tabportal.goViews=goViews;
  window.tabportal.filter=filter;
})(window)
  