    
    function SavedLayout(params){
        
    }

    function Graph(params){
        defaults = {
            'div':$('<div>'),
        }    
        this.params = $.extend(true,defaults,params)
        this.selected = []
        // set default filters
        this.edge_filter = 3 // edge score
        this.node_filter = 1 // degree
        this.cy = cytoscape(this.cytoscape_options)
        
        this.params.div
        .append($('<img>',{class:'snapshot'}))
        .append($('<div>',{class:'cy'}))
        .append($('<ul>',{class:'graph_controls'})
            .append($('<li>')
                .append($('<button>Fit</button>',{})
                    .on({'click':function(){
                        cob.graph.cy.fit()
                    }})
                )
                .append($('<button>Cola Layout</button>',{})
                    .on({'click':function(){
                        var params = {
                            name: 'cola',
                            animate: false, // whether to show the layout as it's running
                            refresh: 1, // number of ticks per frame; higher is faster but more jerky
                            maxSimulationTime: 4000, // max length in ms to run the layout
                            ungrabifyWhileSimulating: true, // so you can't drag nodes during layout
                            fit: false, // on every layout reposition of nodes, fit the viewport
                            padding: 30, // padding around the simulation
                            boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                            
                            // layout event callbacks
                            ready: function(){console.log('Cola ready.')}, // on layoutready
                            stop: function(){console.log('Cola stop.')}, // on layoutstop
                            
                            // positioning options
                            randomize: false, // use random node positions at beginning of layout
                            avoidOverlap: true, // if true, prevents overlap of node bounding boxes
                            handleDisconnected: true, // if true, avoids disconnected components from overlapping
                            nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
                            flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
                            alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
                            
                            // different methods of specifying edge length
                            // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
                            edgeLength: undefined, // sets edge length directly in simulation
                            edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
                            edgeJaccardLength: undefined, // jaccard edge length in simulation
                            
                            // iterations of cola algorithm; uses default values on undefined
                            unconstrIter: undefined, // unconstrained initial layout iterations
                            userConstIter: undefined, // initial layout iterations with user-specified constraints
                            allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
    
                            // infinite layout options
                            infinite: false // overrides all other options for a forces-all-the-time mode
                        };
                        layout = cob.graph.cy.makeLayout(params);
                        layout.run();
                        //cob.graph.cy.center()
                    }})
                )
                .append($('<button>Snapshot</button>',{})
                    .on({'click':function(){
                            $('#cob .graph .snapshop').style.zIndex='100'
                    }})
            )
            .append($('<li>')
                .append('<span>').html('Edge Filter')
                    .append($('<input>',{'value':3})
                        .on({'change':function(){
                            cob.graph.edge_filter = this.value
                            cob.graph.filter()
                        }})
                    )
            )
            .append($('<li>')
                .append('<span>').html('Degree Filter')
                    .append($('<input>',{'value':1})
                        .on({'change':function(){
                            cob.graph.node_filter = this.value
                            cob.graph.filter()
                        }})
                    )
            )

            )
        )

        this.cytoscape_options = {
            container : this.params.div.find('.cy')[0],    
            // General Options 
            minZoom: 1e-50,
            maxZoom: 1e50,
            zoomingEnabled: true,
            userZoomingEnabled: true,
            panningEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
            selectionType: 'single',
            touchTapThreshold: 8,
            desktopTapThreshold: 4,
            autolock: false,
            autoungrabify: false,
            autounselectify: false,

            // rendering options:
            headless: false,
            styleEnabled: true,
            hideEdgesOnViewport: false,
            hideLabelsOnViewport: false,
            textureOnViewport: false,
            motionBlur: false,
            motionBlurOpacity: 0.2,
            wheelSensitivity: 1,
            pixelRatio: 1,
            initrender: function(evt){ /* ... */ },
            renderer: { /* ... */ },
            // Style
            style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'background-color': '#144566',
                    'border-width': 1,
                    'border-color': '#000',
                    'height' : 'mapData(locality,0,1,10,20)',
                    'width'  : 'mapData(locality,0,1,10,20)',
                    'content': 'data(id)',
                    'text-halign': 'right',
                    'font-size' : '12pt',
                    'min-zoomed-font-size': 1
                })
                .selector(':selected')
                .css({
                    'border-width': 7,
                    'border-color': '#09BA00'
                })
                .selector('.neighbors')
                .css({
                    'border-width': 7,
                    'border-color': '#BA0900'
                })
                .selector('.highlighted')
                .css({
                    'border-width': 7,
                    'border-color': '#0900BA'
                })
                .selector('edge')
                .css({
                    'opacity': '0.50',
                    'width': 'mapData(score, 3, 7, 1, 20)',
                    'curve-style': 'haystack' // fast edges!
                }),
            // Layout Algorithm
            layout: { name : 'grid'
               /* 
                  name: 'concentric',
                  fit: true, // whether to fit the viewport to the graph
                  padding: 10, // the padding on fit
                  startAngle: 3/2 * Math.PI, // where nodes start in radians
                  sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
                  clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
                  equidistant: true, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
                  minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
                  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
                  height: 100, // height of layout area (overrides container height)
                  width: 100, // width of layout area (overrides container width)
                  concentric: function(node){ // returns numeric value for each node, placing higher nodes in levels towards the centre
                    return node.degree();
                  },
                  levelWidth: function(nodes){ // the variation of concentric values in each level
                    return nodes.maxDegree() / 4;
                  },
                  animate: false, // whether to transition the node positions
                  animationDuration: 500, // duration of animation in ms if enabled
                  animationEasing: undefined, // easing of animation if enabled
                  ready: function(){console.log('Concentric layout ready.')}, // callback on layoutready
                  stop: function(){console.log('Concentric layout stop.')} // callback on layoutstop
                */
            },
            ready : function(){
                console.log('Cytoscape Web, ready to rock!')
            }
        }

        // filter values need to be stored in the graph object because
        // interface programming sucks.
        this.filter = function(){
            try{
                this.rem_edges.restore() 
                this.rem_nodes.restore()
                this.rem_con_edges.restore()
            }
            catch(e){
                if(e instanceof TypeError){}
            }
            // Get the edges under the filter
            this.rem_edges = this.cy.collection('edge[score <  '+this.edge_filter+']').remove()
            var nodes = this.cy.collection('node[[degree < '+this.node_filter+']]')
            this.rem_con_edges = nodes.connectedEdges().remove()
            this.rem_nodes = nodes.remove()
        }

        this.load = function(json){
            /* Loads a JSON object into a cytoscape thingie and then makes it */     
            this.cy = cytoscape(
                $.extend({},cob.graph.cytoscape_options,{'elements':json})
            )
        }

    }

    function Bar(params){
        defaults = {
            'name' : 'yuckyuck',
            'div'  :  $('<div>',{class:'bar'})
        }
        this.params = $.extend(true,defaults,params)
    }

    function Tab(params){
        defaults = {
            'name' : 'nope',
            'div' : $('<div>',{class:'tab'})
        }
        this.params = $.extend(true,defaults,params)
    
        this.update_table = function(params){
            // delete oldtable
            this[params.name].destroy()
            $('#cob .'+params.name).empty().append(
                $('<thead>').append($('<tr>'))
            )
            a=1
            for (var i=0; i<params.header.length; i++){
                $('#cob table.'+params.name+' thead tr')
                .append($('<th>'+params.header[i]+'</th>'))
            }
            this[params.name] = $('#cob .'+params.name).DataTable(
                $.extend(true,{
                "processing" : true,
                "autoWidth": true, 
                "bPaginate": false,
                "bJQueryUI": true,
                "bScrollCollapse": true,
                "bAutoWidth": true,
                "sScrollXInner": "100%",
                "sScrollX": '100%',
                "sScrollY":  '100%',
                },params)
            )
            $('#cob .LociTable tbody').on('click','tr',function(){
                $(this).toggleClass('selected')
                $('#cob .LociTable .selected').toggleClass('selected')
                gene = $('td',this).eq(0).text();
                cob.graph.cy.center(
                    cob.graph.cy.nodes('node[id="'+gene+'"]').select()
             )
        })

        }
        this.add_table = function(params){
            this.params.div
                .append(
                    $('<table>',{class: params.name+' display',cellspacing:'0',width:'100%'})
                    .append($('<thead>')
                            .append($('<tr>')
                            )
                    )
                )
            for (var i=0; i<params.header.length; i++){
                this.params.div.find('table.'+params.name+' thead tr')
                .append($('<th>'+params.header[i]+'</th>'))
            }
            this[params.name] = $('#cob .'+params.name).DataTable(
                $.extend(true,{
                "processing" : true,
                "autoWidth": true, 
                "bPaginate": false,
                "bJQueryUI": true,
                "bScrollCollapse": true,
                "bAutoWidth": true,
                "sScrollXInner": "100%",
                "sScrollX": '100%',
                "sScrollY":  '100%',
                },params)
            )
        }

    } // End Tab
    
    function Menu(params){
        // Initialize Tables
        this.tabs = []
        this.handle = []
        //this.tables = []
        defaults = {
            'div' : $('<div>',{'class':'menu'}),
            'header' : $('<ul>',{'class':'header'}),
            'tabs' : $('<div>',{'class':'tabs'})
        }
        this.params = $.extend(true,defaults,params)
        // Add the ontology and term table
        this.params.div.append(this.params.header)
        this.params.div.append(this.params.tabs)
        this.tabwidth = this.params.div.width()
        var that = this

        this.params.header.on('click','li',function(){
            that.show_tab.call(that,$(this).index())
        });

        this.show_tab = function(tabname){
            var index = undefined
            if (!isNaN(parseFloat(tabname)) && isFinite(tabname) && tabname < this.tabs.length){
                // is tab index, return that index 
                index = tabname
                this.params.tabs.css('left','-'+(this.tabwidth*index)+'px')
            }
            for(var i=0; i< this.tabs.length;i++){
                // check each tab for tabname
                if (this.tabs[i].params.name == tabname){
                    index = i
                    this.params.tabs.css('left','-'+(this.tabwidth*index)+'px')
                }
            }
            $('#cob .menu li.selected').toggleClass('selected')
            $(this.params.header.children()[index]).toggleClass('selected')
            return undefined
        }
   
        this.add_tab = function(tab){
            /*  
                This function adds a tab to the menu div.
            */
            // make the tab as wide as the tab section
            tab.params.div.css('width',this.tabwidth+'px')
            this.params.tabs.css('width',(this.tabs.length+1)*this.tabwidth+'px')
            // Append the Tabs name to the header section
            this.params.header.append($('<li>').html(tab.params.name))
            this.params.tabs.append(tab.params.div)
            this.tabs.push(tab)
        }

        this.get_tab = function(tabname){
            ///
            if (!isNaN(parseFloat(tabname)) && isFinite(tabname) && tabname < this.tabs.length)
                // is tab index, return that index 
                return this.tabs[tabname]
            for(var i=0; i< this.tabs.length;i++){
                // check each tab for tabname
                if (this.tabs[i].params.name == tabname)
                    return this.tabs[i]
            }
            return undefined
        }

    }

    function Footer(params){
    }

    function Header(params){
    }

    function COB(params){
        // Extend the default parameters
        var timeout;
        defaults = {
            'div': $('<div>'),
        }    
        this.params = $.extend(true,defaults,params)

        this._delay = function(func,wait){
            /*
                Delay the calling of a function
            */
            var args = Array.prototype.slice.call(arguments,2);
            return setTimeout(function(){return func.apply(null,args);}, wait);
        }

        this.params.div
            .append($('<div>',{class:'graph'}))
            .append($('<div>',{class:'menu'}))
            .append($('<div>',{class:'footer'}))
            .append($('<div>',{class:'header'}))
        this.graph = new Graph({
            'div' :$("#cob .graph")
        });
        this.menu = new Menu({
            'div' :$('#cob .menu')
        });


        this.menu.add_tab(new Tab({'name':'Dataset'}))
        this.menu.add_tab(new Tab({'name':'Network'}))
        this.menu.add_tab(new Tab({'name':'Genes'}))
        // Choose the first tab
        this.menu.show_tab(0)

        this.menu.get_tab("Dataset").add_table({
            "name" : 'OntologyTable',
            "header" : ['Ontology','Description'],
            "ajax":"cob/available_datasets/GWAS",
            'sScrollY': this.menu.params.div.innerHeight()/4
        })
        this.menu.get_tab('Dataset').add_table({
            "name":'TermTable',
            'header':['Name','Desc','Num SNPs','Num Genes'],//,'Root Genes'],
            'sScrollY': this.menu.params.div.innerHeight()/4
        })
        this.menu.get_tab('Network').add_table({
            "name":'NetworkTable',
            "header":['Network','Description'],
            "ajax":"cob/available_datasets/Expr",
            'sScrollY':this.menu.params.div.innerHeight()/4
        })

        this.menu.get_tab('Genes').highlighted_rows = []
        this.menu.get_tab('Genes').add_table({
            'name': 'LociTable',
            'header': ['Locus',
                    'Chr',
                    'Start',
                    'End',
                    'Strand',
                    'Global Degree',
                    'Term SNPs'
                ],
            'sScrollY': this.menu.params.div.innerHeight()/2,
        })
        
        this.footer = new Footer({});
        this.header = new Header({});

        /*--------------------------------
        // Register top level events
        ---------------------------------*/
        $('#cob .OntologyTable tbody').on('click','tr', function() {
            var name = $('td',this).eq(0).text();
            cob.menu.get_tab('Dataset').TermTable.clear()
            .ajax.url("cob/Ontology/Terms/"+name).load().draw()
            cob.menu.LoadedOntology = name
            $('#cob .OntologyTable .selected').toggleClass('selected')
            $(this).toggleClass('selected')
        });
        $('#cob .TermTable tbody').on('click','tr', function(){
            // Load the available networks for the Term
            cob.menu.LoadedTerm = $('td',this).eq(0).text();
            $('#cob .TermTable .selected').toggleClass('selected')
            $(this).toggleClass('selected')
            cob.menu.show_tab('Network')
        })
        $('#cob .NetworkTable tbody').on('click','tr',function(){
            $('#cob .NetworkTable .selected').toggleClass('selected')
            $(this).toggleClass('selected')
            cob.menu.LoadedNetwork = $('td',this).eq(0).text();
            $.getJSON('cob/COB/'+cob.menu.LoadedNetwork+'/'+cob.menu.LoadedOntology+'/'+cob.menu.LoadedTerm)
                .done(function(data){
                    console.log('loading data')
                    cob.graph.load(data)
                })
                .fail(function(data){
                    console.log("Nopers")
                })
        })

        this.graph.cy.on('cxttap','node',{},function(evt){
            var node = evt.cyTarget
            node.toggleClass('highlighted')
        })
        this.graph.cy.on('click',function(evt){
            if(evt.cyTarget == cob.graph.cy){
                //remove all non-sticky decorators
                $('#cob .LociTable .selected').toggleClass('selected')
                cob.graph.cy.$('.neighbors').removeClass('neighbors')
            }
        })
        this.graph.cy.on('click','node',{},function(evt){
            var node = evt.cyTarget
            console.log("CLICKED "+node.id())
            console.log(node.data())
            // If already highlighted, also highlight neighbos
            if(node.selected()){
                console.log("Already CLICKED "+node.id())
                _.delay(function(id){
                    cob.graph.cy.$('.neighbors').removeClass('neighbors')
                    cob.graph.cy.$('[id="'+id+'"]').unselect().neighborhood().select()
                },100,node.id())
            } 
            else{
                // highlight neighbors
                //unhighlight old rows
                cob.menu.get_tab('Genes').LociTable.rows(cob.menu.get_tab('Genes').highlighted_rows)
                    .nodes()
                    .to$()
                    .toggleClass('selected')
                // highlight new rows
                cob.menu.get_tab('Genes').highlighted_rows = cob.menu.get_tab('Genes')
                    .LociTable.rows().flatten()
                    .filter(function(rowIdx){
                        return cob.menu.get_tab('Genes').LociTable.cell(rowIdx,0).data() == node.id() ? true : false;
                })
                cob.graph.cy.$('.neighbors').removeClass('neighbors')
                node.neighborhood().addClass('neighbors')
            }
        })
        this.graph.cy.on('select',{},function(evt){
            cob.graph.selected = []
            clearTimeout(timeout)
            timeout = setTimeout(function(){
                cob.graph.cy.elements(':selected')
                .filter(function(){return this.isNode()})
                .each(function(){
                    cob.graph.selected.push(this.id()) 
                })
            
                //cob.loci.LociTable.search(cob.graph.selected.join("|"),true).draw()
            },100)
        })

        this.load_annotations = function(){
            return;
            // get a list of loaded nodes
            var nodes = this.graph.cy.nodes()
            var node_ids = []
            for(var i=0; i < nodes.length; i++){
                // Push if the id 
                if(nodes[i].degree() >= cob.graph.node_filter){
                    node_ids.push(nodes[i].id())
                }
            }
            try{
                // Fetch ajax
                $.getJSON("cob/Annotations/"
                    +cob.menu.LoadedNetwork
                    +"/"+cob.menu.LoadedOntology
                    +"/"+cob.menu.LoadedTerm+"?genes="
                    +node_ids.join(','))
                .success(
                    function(data){
                        data.name = 'LociTable'
                        data['sScrollY'] = cob.menu.params.div.innerHeight()-200
                        cob.menu.get_tab('Genes').update_table(data)
                    }
                )
            }
            catch(err){
                
            }
        }
    }