$('document').ready(function () {

    let clipboard = null;

    function handleCut()
    {
        let tree = $("#jstree").jstree(true)
        clipboard = { type: 'cut', nodes: $('#jstree').jstree('get_selected', true) };
        clipboard.nodes.forEach(node => {
            tree.cut(node);
        });
    }
    function handleCopy()
    {   
        clipboard = { type: 'copy', nodes: $('#jstree').jstree('get_selected', true) };
    }
    function handlePaste($node)
    {
        let tree = $("#jstree").jstree(true )
        let parent = tree.get_node($node);

        if (!parent) return;

        let childNodes = parent.children;

        let isInDir = function (nodeText) {
            return childNodes.some(element => {
                return tree.get_text(element) === nodeText;
            });
        };

        let nodesToPaste = clipboard.nodes.filter(node => !isInDir(node.text));

        if (nodesToPaste.length !== clipboard.nodes.length) {
            swal({
                type: "warning",
                title: 'Duplicate node found',
                text: `Some nodes could not be pasted because of duplicate names in the target directory.`
            }).then(() => {
            });
        }

        nodesToPaste.forEach(node => {
            if (clipboard.type === 'cut') {
                tree.move_node(node, parent, 'last');
            } else if (clipboard.type === 'copy') {
                tree.copy_node(node, parent, 'last');
            }
        });

        clipboard = null;
    }

    let caseSensitive = false;

    $('#case_sensitive').on('click', function () {
        caseSensitive = !caseSensitive;
        $(this).toggleClass('active', caseSensitive);

        $('#search_input').trigger('input');
    });



    let opened = false;
    $('#expand_nodes').on('click', function () {
        if (!opened) {
            $('#jstree').jstree("open_all")
            opened = true
        }
        else {
            $('#jstree').jstree("close_all")
            opened = false
        }

    })

    $('#jstree').on('open_node.jstree', function (e, data) {
        if (data.node.id !== 'j1_1') {
            $('#jstree').jstree(true).set_icon(data.node, "fa-regular fa-folder-open");
        }
    });
    $('#jstree').on('close_node.jstree', function (e, data) {

        if (data.node.id !== 'j1_1') {
            $('#jstree').jstree(true).set_icon(data.node, "fa-solid fa-folder");
        }else{
        setTimeout(function () {
            $('#jstree').jstree(true).open_node(data.node);
        }, 0);
    }
    });

    $('#jstree').on('select_node.jstree', function (e, data) {

        selectedName = data.node.text;
        originalPath = data.node.parents;
        let truePath = originalPath;
        path = truePath.join('/');
        path = path.split("").reverse().join("");
        path = path + '/' + selectedName;
        // console.log(data.node);

        let parents = originalPath;
        let newpath = "";
        for (nodeid of parents) {
            if (nodeid == '#') {
                newpath = "/" + newpath;
                break;
            }
            var node = data.instance.get_node(nodeid, false);
            newpath = node.text + "/" + newpath;
        }
        newpath += selectedName;
        // console.log(newpath);
    });

    function getFileIcon(filename) {
        let extension = filename.split('.').pop().toLowerCase();

        switch (extension) {
            case 'js':
                return 'bx bxl-javascript';
            case 'html':
                return 'bx bxl-html5';
            case 'css':
                return 'bx bxl-css3';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'fa-solid fa-file-image';
            case 'c':
                return "fa-solid fa-copyright";
            case 'cpp':
                return 'bx bxl-c-plus-plus';
            case 'py':
                return 'bx bxl-python';
            case 'java':
                return 'bx bxl-java';
            case 'db':
                return 'bx bx-data';
            default:
                return 'fa-solid fa-file';
        }
    }

    let treeData = [
        {
            "text": "home",
            "icon": "fa-solid fa-folder-tree",
            "state": { "opened": true },
            'type': "folder",
            "children": []
        }
    ];

    for (let i = 1; i <= 10; i++) {
        treeData[0].children.push({
            "text": "Root node " + i,
            "icon": "fa-solid fa-folder",
            "type": "folder",
            "children": [
                {
                    "text": "Child node " + i + ".1.c",
                    "type": "file",
                    "icon": getFileIcon("Child node " + i + ".1.c")
                },
                {
                    "text": "Child node " + i + ".2.jpg",
                    "type": "file",
                    "icon": getFileIcon("Child node " + i + ".2.jpg")
                },
                {
                    "text": "Child node " + i + ".3.js",
                    "type": "file",
                    "icon": getFileIcon("Child node " + i + ".3.js")
                }
            ]
        });
    }
    $('#jstree').jstree({
        'plugins': [
            'dnd',
            'contextmenu',
            'types',
            'search',
            'sort'
        ],
        'multiple':true,
        'core': {
            'check_callback': function (operation, node, node_parent, node_position, more) {
                if (operation === 'create_node') {
                    if (node_parent && $('#jstree').jstree(true).get_node(node_parent).original.type === 'file') {
                        swal({
                            type: 'error',
                            title: 'Invalid Creation',
                            text: "Cannot create a file/ folder under a file"
                        }).then((result) => {
                            return false
                        });
                        return false;
                    }
                }
                if (operation === 'move_node' || operation === 'copy_node') {
                    if (node_parent && $('#jstree').jstree(true).get_node(node_parent).original.type === 'file') {
                        
                        return false;
                    }                    
                }
                
                return true;
                
            },
            'data': treeData
        },
        'contextmenu': {
            'items': function ($node) {
                var tree = $("#jstree").jstree(true);

                return {
                    "New": {
                        "separator_before": false,
                        "separator_after": true,
                        "label": "New",
                        "action": false,
                        "_disabled": function (data) {
                           return $node.original.type === 'file'
                        },
                        "submenu": {
                            "create_file": {
                                "separator_before": false,
                                "separator_after": false,
                                "label": "File",
                                "action": function (obj) {
                                    $node = tree.create_node($node, { text: "New File", icon: "fa fa-file", type: "file" });
                                    tree.edit($node);
                                    
                                }
                            },
                            "create_folder": {
                                "separator_before": false,
                                "separator_after": false,
                                "label": "Folder",
                                "action": function (obj) {
                                    $node = tree.create_node($node, { text: "New Folder", icon: "fa fa-folder", type: "folder" });
                                    tree.edit($node);
                                    
                                }
                            }
                        }
                    },
                    "cut": {
                        "separator_before": false,
                        "separator_after": false,
                        "label": "Cut",
                        "action":handleCut
                    },
                    "copy": {
                        "separator_before": false,
                        "separator_after": false,
                        "label": "Copy",
                        "action": handleCopy
                    },
                    "paste": {
                        "separator_before": false,
                        "separator_after": false,
                        "label": "Paste",
                        "_disabled": function (data) {
                            return !clipboard || clipboard.nodes.length === 0;
                        },
                        "action": function (data) {
                            handlePaste($node);
                        }
                    },
                    "Rename": {
                        "separator_before": false,
                        "separator_after": false,
                        "label": "Rename",
                        "action": function (obj) {
                            tree.edit($node);
                            
                        }
                    },
                    "Remove": {
                        "separator_before": false,
                        "separator_after": false,
                        "label": "Delete",
                        "action": function (obj) {
                            if (confirm("Are you sure you want to delete this item?")) {
                                tree.delete_node($node);
                            }
                        }
                    }
                };
            }
        },
        'search': {
            "case_sensitive": false
        }
    });

    function fileUpload(file) {
        let tree = $('#jstree').jstree(true);
        let selected = tree.get_selected();
        if (!selected.length) {
            selected = ['#'];
        }
        selected = selected[0];

        let newNode = {
            "text": file.name,
            "icon": getFileIcon(file.name),
            "type": "file"
        };

        let parentNode = tree.get_node(selected);
        let isDuplicate = parentNode.children.some(function (childId) {
            let sibling = tree.get_node(childId);
            return sibling.text.trim() === file.name;
        });

        if (isDuplicate) {
            newNode.text = getUniqueName(tree, parentNode, file.name);
        }

        tree.create_node(selected, newNode);
    }

    $('#upload_file').on('click', function () {
        $('#file_input').click();
    });

    $('#file_input').on('change', function () {
        let files = this.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                fileUpload(files[i]);
            }
        }
    });

    $('#create_file').on('click', function () {
        createNode('file');
    });

    $('#create_folder').on('click', function () {
        createNode('folder');
    });

    function createNode(type) {
        let tree = $('#jstree').jstree(true);
        let selected = tree.get_selected();
        if (!selected.length) {
            selected = ['#'];
        }
        selected = selected[0];


        let newNode = {
            "text": "New " + type.charAt(0).toUpperCase() + type.slice(1),
            "icon": type === 'folder' ? 'fa-solid fa-folder' : 'fa-solid fa-file',
            "type": type === 'folder' ? 'folder' : 'file'
        };

        let createdNode = tree.create_node(selected, newNode);
        if (createdNode) {
            tree.edit(createdNode);
            
        }
    }

    $('#delete_node').on('click', function () {
        let tree = $('#jstree').jstree(true);
        let selected = tree.get_selected();
        if (!selected.length) {
            swal({
                type: "warning",
                title: '',
                text: "Please select a file or folder to delete"
            }).then((result) => {

            });
            return;
        }
        else {
            let confirmation = confirm("Are you sure want to delete?")
            if (confirmation) {
                tree.delete_node(selected);
            }
        }

    });

    $('#search_input').on('input', function () {
        let searchString = $(this).val();
        let tree = $('#jstree').jstree(true);


        $('#jstree').find('.custom-highlight').removeClass('custom-highlight');

        tree.search(searchString);
        if (searchString) {
            $('#jstree').find('.jstree-search').each(function () {
                $(this).addClass('custom-highlight');

            });
        }
    });

    function getUniqueName(tree, parentNode, baseName) {
        let counter = 1;
        let uniqueName = baseName;
        while (parentNode.children.some(function (childId) {
            let sibling = tree.get_node(childId);
            return sibling.text.trim() === uniqueName;
        })) {
            uniqueName = baseName + ' (' + counter + ')';
            counter++;
        }

        return uniqueName;
    }
    // ---------------------------------------------------------
    $('#jstree').on('rename_node.jstree', function (e, data) {
        let tree = $('#jstree').jstree(true);
        let parentNode = tree.get_node(data.node.parent);
        let newName = data.text.trim();

        if (newName.includes('/')) {
            swal({
                type: 'error',
                title: 'Invalid Name',
                text: "'/' is not allowed in a folder or file name"
            }).then((result) => {
                let defaultName = data.node.original.type === 'file' ? "New file" : "New folder";
                tree.rename_node(data.node, defaultName);

                setTimeout(function () {
                    tree.edit(data.node);
                }, 0);
            });
        }

        let isDuplicate = parentNode.children.some(function (childId) {
            let sibling = tree.get_node(childId);
            return sibling.text.trim() === newName && sibling.id !== data.node.id;
        });

        let forbidden = data.node.original.type;
        if (forbidden !== 'custom') {
            if (isDuplicate) {
                let uniqueName = getUniqueName(tree, parentNode, newName);
                tree.rename_node(data.node, uniqueName); 
                
            } else {
                if (data.node.original.type === "folder") {
                    tree.set_icon(data.node, "fa-solid fa-folder");
                    
                } else {
                    tree.set_icon(data.node, getFileIcon(newName));
                    
                }
            }
        }
    });
    let isMoving = false;
    $('#jstree').on('move_node.jstree', function (e, data) {
        let tree = $('#jstree').jstree(true);
        let targetNode = tree.get_node(data.node.parent);
        let movedNode = tree.get_node(data.node);
        if(isMoving)
        {
            return
        }

        let childNodes = targetNode.children;
        let isDuplicate = childNodes.some(childId => {
            return tree.get_text(childId) == tree.get_text(movedNode) && tree.get_node(movedNode).id !== tree.get_node(childId).id;
        });

        if (isDuplicate) {
            isMoving = true
            tree.move_node(movedNode, data.old_parent, data.position, false);
            isMoving = false
            swal({
                type: "error",
                title: 'Duplicate node found',
                text: `A file or folder named "${tree.get_text(movedNode)}" already exists in the target directory.`
            }).then((result) => {

            });
        }
    });

    $('#jstree').on('create_node.jstree', function (e, data) {
        let tree = $('#jstree').jstree(true);

        let selectedNodes = tree.get_selected(true);

        if (selectedNodes.length <= 0) {
            return
        }

        if (selectedNodes.length > 0) {
            let selectedNode = selectedNodes[0];
            if (selectedNode.original.type === 'file') {
                swal({
                    type: "error",
                    title: '',
                    text: "Not possible to create file/folder under a file"
                }).then((result) => {

                });                tree.delete_node(data.node);
            }
        }
        let selectedNode = selectedNodes[0];
        if (selectedNode.original.type === "file") {
            return;
        }
    });
    // --------------------Till here-------------------
    function loadFileContent(fileName) {

        $('#file_content').text('Content of ' + fileName + ' goes here...');
    }

    $('#jstree').on('select_node.jstree', function (e, data) {
        let selectedNode = data.node;
        if (selectedNode.icon && !selectedNode.icon.includes('fa-folder')) {
            loadFileContent(selectedNode.text);
        } else {
            $('#file_content').text('Select a file to view its content...');
        }
    });
    $('#toggle_sidebar').click(function () {
        $('.sidebar').toggle();
        $(this).toggleClass('collapsed');

        if ($(this).hasClass('collapsed')) {
            $(this).html('<i class="fa-solid fa-angle-right"></i>');
        } else {
            $(this).html('<i class="fa-solid fa-angle-left"></i>');
        }
    });

    let selected = null;
    $("#jstree").on("keydown", function (e) {

        tree = $("#jstree").jstree(true);
        selected = tree.get_selected();

        if (e.ctrlKey && e.key == 'c') {
            e.preventDefault();
            handleCopy()
            
        }
        else {
            if (e.ctrlKey&& e.key == 'v') {
                e.preventDefault();
                if (selected) {
                    handlePaste(selected);
                }
            }
            else {
                if (e.ctrlKey&& e.key == 'x') {
                    e.preventDefault();
                    handleCut()
                    
                }
                    
            }
        }
    });
});
