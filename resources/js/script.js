var UI = (function UI_MAIN() {
    var input, radioOrdered, radioUnordered,
        toDoDiv, toDoList, toDoListName, toDoListNameEditor,
        DOMStrings, counter,
        enterEditorMode, exitEditorMode, setupEventListeners, showMessage,
        showHistoryElementsCount, createHistoryItemElement,
        getInputValue, handleListType, handleListHeader, createListItemElement,
        drawListsSelectionsElement, clearListsSelections;

    //named list of DOMStrings used in app.
    //The rules of using DOMString:
    //   - item name should contain its type (e.g. someStringId, or someStringClass etc.)
    //   - item value should be the same as in html, without any selectors (# or .)
    //   - when using DOMString in jQuery you manually add needed selector based on name
    //     of item (e.g. $('#' + someStringId) or $('.' + someStringClass)). We use it like that
    //     because often you dont need selector included in DOMString (e.g. toggleClass(), addClass() etc.)
    DOMStrings = {
        //ids
        inputId: 'input-text',
        toDoListTypeId: 'list-type',
        toDoDivId: 'to-do',
        toDoListId: 'to-do-list',
        toDoListNameId: 'to-do-list-name',
        toDoListNameEditorId: 'to-do-list-name-editor',
        taskHistoryId: 'task-history',
        taskHistoryListId: 'task-history-list',
        taskHistoryHeaderId: 'task-history-header',
        listsShowBtnId: 'show-lists',
        listsHideBtnId: 'hide-lists',
        listsSaveBtnId: 'save-current-list',
        listsLoadBtnId: 'load-selected-list',
        listsRemoveBtnId: 'remove-selected-list',
        listsNewBtnId: 'new-list',
        listsContainerId: 'lists-selections-container',
        listsSelectionsId: 'list-selections',
        listsNavId: 'lists-navigation',
        messageId: 'message',

        //prefixes, names
        listItemRemoveBtnIdPrefix: 'remove-btn-',
        listItemDoneBtnIdPrefix: 'done-btn-',
        listItemUnDoneBtnIdPrefix: 'undone-btn-',
        listItemIdPrefix: 'item-',
        listItemTextIdPrefix: 'item-text-',
        listItemEditorIdPrefix: 'item-editor-',
        listsSelectionsElementName: 'saved-list',
        listSelectionsElementIdPrefix: 'saved-list-',

        //classes
        orderedListClass: 'decimal-list',
        hiddenClass: 'hidden'
    }

    //defining basic elements
    DOMElements = {
        input: $('#' + DOMStrings.inputId),
        toDoListType: $('#' + DOMStrings.toDoListTypeId),
        toDoDiv: $('#' + DOMStrings.toDoDivId),
        toDoList: $('#' + DOMStrings.toDoListId),
        toDoListName: $('#' + DOMStrings.toDoListNameId),
        toDoListNameEditor: $('#' + DOMStrings.toDoListNameEditorId),
        taskHistory: $('#' + DOMStrings.taskHistoryId),
        taskHistoryList: $('#' + DOMStrings.taskHistoryListId),
        taskHistoryHeader: $('#' + DOMStrings.taskHistoryHeaderId),
        taskHistoryHeaderCount: $('#' + DOMStrings.taskHistoryHeaderId).children('span'),
        listsShowBtn: $('#' + DOMStrings.listsShowBtnId),
        listsHideBtn: $('#' + DOMStrings.listsHideBtnId),
        listsSaveBtn: $('#' + DOMStrings.listsSaveBtnId),
        listsLoadBtn: $('#' + DOMStrings.listsLoadBtnId),
        listsRemoveBtn: $('#' + DOMStrings.listsRemoveBtnId),
        listsNewBtn: $('#' + DOMStrings.listsNewBtnId),
        listsContainer: $('#' + DOMStrings.listsContainerId),
        listsSelections: $('#' + DOMStrings.listsSelectionsId),
        listsNav: $('#' + DOMStrings.listsNavId),
        message: $('#' + DOMStrings.messageId)

    };

    getInputValue = function () {
        var inputVal = DOMElements.input.val();
        DOMElements.input.val('');

        return inputVal;

    };

    handleListType = function (isChecked) {
        if (isChecked === undefined) {
            //check radio selector and toggle style if needed
            if (DOMElements.toDoListType.is(':checked')) {
                DOMElements.toDoList.addClass(DOMStrings.orderedListClass);
                return true;
            } else {
                DOMElements.toDoList.removeClass(DOMStrings.orderedListClass);
                return false;

            }

        } else {
            DOMElements.toDoListType.attr('checked', isChecked);
            return handleListType();

        }

    };

    handleListHeader = function (name) {
        if (name !== undefined) {
            DOMElements.toDoListName.text(name);

        }

        return DOMElements.toDoListName.text();

    };

    showHistoryElementsCount = function () {
        var historyElementsCount = DOMElements.taskHistoryList.children('li').length;
        if (historyElementsCount > 0) {
            DOMElements.taskHistoryHeaderCount.text('(' + historyElementsCount + ')');

        } else {
            DOMElements.taskHistoryHeaderCount.text('');

        };

    };

    createListItemElement = function (id, value) {
        var itemHtmlString, listItemObj;

        //generate list's item <li> with delete btn <i>
        itemHtmlString = '<li id="' + DOMStrings.listItemIdPrefix + id + '"><input id="' + DOMStrings.listItemEditorIdPrefix + id + '" class="hidden" type="text"><span id="' + DOMStrings.listItemTextIdPrefix + id + '">' + value + '</span><i id="' + DOMStrings.listItemDoneBtnIdPrefix + id + '" class="material-icons">done</i><i id="' + DOMStrings.listItemRemoveBtnIdPrefix + id + '" class="material-icons">clear</i></li>';
        DOMElements.toDoList.append(itemHtmlString);

        listItemObj = {
            listItem: $('#' + DOMStrings.listItemIdPrefix + id),
            listItemText: $('#' + DOMStrings.listItemTextIdPrefix + id),
            listItemEditor: $('#' + DOMStrings.listItemEditorIdPrefix + id),
            listItemDoneBtn: $('#' + DOMStrings.listItemDoneBtnIdPrefix + id),
            listItemRemoveBtn: $('#' + DOMStrings.listItemRemoveBtnIdPrefix + id)
        };

        //adding event listener to text and editor
        listItemObj.listItemText.click({
            textElement: listItemObj.listItemText,
            editorElement: listItemObj.listItemEditor
        }, enterEditorMode);
        listItemObj.listItemEditor.keyup({
            textElement: listItemObj.listItemText,
            editorElement: listItemObj.listItemEditor
        }, exitEditorMode);
        listItemObj.listItemEditor.blur({
            textElement: listItemObj.listItemText,
            editorElement: listItemObj.listItemEditor
        }, exitEditorMode);

        return listItemObj;

    };

    removeListItemElement = function (id) {
        $('#' + DOMStrings.listItemIdPrefix + id).remove();
        showHistoryElementsCount();

    };

    updateListItemElement = function (id, value, isDone) {
        $('#' + DOMStrings.listItemTextIdPrefix + id).text(value);

    };

    createHistoryItemElement = function (id, value) {
        var itemHtmlString, listItemObj;

        //generate list's item <li> with delete btn <i>
        itemHtmlString = '<li id="' + DOMStrings.listItemIdPrefix + id + '"><span id="' + DOMStrings.listItemTextIdPrefix + id + '">' + value + '</span><i id="' + DOMStrings.listItemUnDoneBtnIdPrefix + id + '" class="material-icons">undo</i><i id="' + DOMStrings.listItemRemoveBtnIdPrefix + id + '" class="material-icons">clear</i></li>';
        DOMElements.taskHistoryList.prepend(itemHtmlString);

        listItemObj = {
            listItem: $('#' + DOMStrings.listItemIdPrefix + id),
            listItemText: $('#' + DOMStrings.listItemTextIdPrefix + id),
            listItemEditor: $('#' + DOMStrings.listItemEditorIdPrefix + id),
            listItemUnDoneBtn: $('#' + DOMStrings.listItemUnDoneBtnIdPrefix + id),
            listItemRemoveBtn: $('#' + DOMStrings.listItemRemoveBtnIdPrefix + id)
        };

        showHistoryElementsCount();

        return listItemObj;

    };

    drawListsSelectionsElement = function (elId, elName) {
        var element, elementHtml, p;

        element = $('#' + DOMStrings.listSelectionsElementIdPrefix + elId);

        if (element.attr('id') == DOMStrings.listSelectionsElementIdPrefix + elId) {
            var label;
            label = element.next();
            label.text(elName);

        } else {
            p = $('p');
            if (p) p.remove();

            elementHtml = '<input type="radio" name="' + DOMStrings.listsSelectionsElementName + '" id="' + DOMStrings.listSelectionsElementIdPrefix + elId + '" value="' + elId + '"><label for="' + DOMStrings.listSelectionsElementIdPrefix + elId + '">' + elName + '</label>';

            DOMElements.listsSelections.append(elementHtml);

        };

    }

    clearListsSelections = function () {
        DOMElements.listsSelections.empty();
        DOMElements.listsSelections.append('<p>no lists were saved yet...</p>');

    };

    setupEventListeners = function () {

        //add event listeners to ordered/unordered list type checbox
        DOMElements.toDoListType.on('change', function () {
            handleListType();

        });

        //add event listeners on to-do-list to switch between name-view and name-editor
        DOMElements.toDoListName.click({
            textElement: DOMElements.toDoListName,
            editorElement: DOMElements.toDoListNameEditor
        }, enterEditorMode);
        DOMElements.toDoListNameEditor.keyup({
            textElement: DOMElements.toDoListName,
            editorElement: DOMElements.toDoListNameEditor
        }, exitEditorMode);
        DOMElements.toDoListNameEditor.blur({
            textElement: DOMElements.toDoListName,
            editorElement: DOMElements.toDoListNameEditor
        }, exitEditorMode);

        //add event listener to history header (hide/unhide history)
        DOMElements.taskHistoryHeader.click(function (e) {
            DOMElements.taskHistory.toggleClass(DOMStrings.hiddenClass);

        });

        //event listeners for lists navigation
        DOMElements.listsShowBtn.click(function () {
            DOMElements.listsNav.addClass(DOMStrings.hiddenClass);
            DOMElements.listsContainer.removeClass(DOMStrings.hiddenClass);

        });

        DOMElements.listsHideBtn.click(function () {
            DOMElements.listsContainer.addClass(DOMStrings.hiddenClass);
            DOMElements.listsNav.removeClass(DOMStrings.hiddenClass);

        });

        DOMElements.listsLoadBtn.click(function () {
            showMessage('Loaded..');

            DOMElements.listsContainer.addClass(DOMStrings.hiddenClass);
            DOMElements.listsNav.removeClass(DOMStrings.hiddenClass);

        });

        DOMElements.listsSaveBtn.click(function () {
            showMessage('Saved..');

        });

        DOMElements.listsRemoveBtn.click(function () {
            showMessage('Removed..');

        });

        DOMElements.listsNewBtn.click(function () {
            showMessage('New list created..')

        });

    };

    showMessage = function (text) {
        DOMElements.message.text(text);
        DOMElements.message.fadeIn(0);
        DOMElements.message.fadeOut(1000);

    };



    //COOMON FUNCTIONS FOR EDITING TEXT
    //The idea is:
    //   - we want to edit plain text,
    //   - to do so we create hidden input element
    //   - and two functions to switch bwetween modes: view and edit
    //   - view mode: we just show text element (p, li, div etc.) with it's text
    //   - edit mode: we hide text element and show input element
    enterEditorMode = function (e) {
        var data = e.data;
        data.editorElement.val(data.textElement.text());
        data.textElement.addClass(DOMStrings.hiddenClass);
        data.editorElement.removeClass(DOMStrings.hiddenClass);
        data.editorElement.select();

    };

    exitEditorMode = function (e) {
        var data = e.data;
        if (e.keyCode === 13 || e.keyCode === 27 || e.type === 'blur') {
            data.editorElement.addClass(DOMStrings.hiddenClass);
            data.textElement.removeClass(DOMStrings.hiddenClass);

        }

    };


    return {
        getDOMStrings: function () {
            return DOMStrings;

        },
        getDOMElements: function () {
            return DOMElements;

        },
        setDOMElements: function (key, value) {
            DOMElements[key] = value;
            return DOMElements;

        },
        getInputValue: function () {
            return getInputValue();

        },
        handleListType: function (isChecked) {
            return handleListType(isChecked);

        },
        handleListHeader: function (name) {
            return handleListHeader(name);

        },
        createListItemElement: function (itemId, itemValue) {
            return createListItemElement(itemId, itemValue);

        },
        removeListItemElement: function (itemId) {
            removeListItemElement(itemId);

        },
        updateListItemElement: function (itemId, itemValue, isDone) {
            updateListItemElement(itemId, itemValue, isDone);

        },
        createHistoryItemElement: function (itemId, itemValue) {
            return createHistoryItemElement(itemId, itemValue);

        },
        clearToDoAndHistoryLists: function () {
            DOMElements.toDoList.empty();
            DOMElements.taskHistoryList.empty();
            DOMElements.taskHistoryHeaderCount.empty();

        },
        setupEventListeners: function () {
            setupEventListeners();

        },
        clearListsSelections: function () {
            clearListsSelections();

        },
        drawListsSelectionsElement: function (elId, elName) {
            drawListsSelectionsElement(elId, elName);

        }

    }

})();

var DATA = (function DATA_MAIN() {
    var storage, List, listsHolder, getId;
    storage = window.localStorage;

    listsHolder = {
        listsArr: [],
        listsIndexArr: [],
        saveItem: function (itemObj) {
            var itemIndex = this.listsIndexArr.indexOf(itemObj.id);

            if (itemIndex === -1) {
                this.listsArr.push(itemObj);
                this.listsIndexArr.push(itemObj.id);

            } else {
                this.listsArr.splice(itemIndex, 1, itemObj);

            }

            this.handleStorage('SET');
            return this.listsArr;

        },
        removeItem: function (itemId) {
            var itemIndex = this.listsIndexArr.indexOf(itemId);
            if (itemIndex === -1) return this.listsArr;

            this.listsArr.splice(itemIndex, 1);
            this.listsIndexArr.splice(itemIndex, 1);

            this.releaseId(itemId);

            this.handleStorage('SET');
            return this.listsArr;

        },
        getItem: function (itemId) {
            var itemIndex = this.listsIndexArr.indexOf(itemId);
            if (itemIndex === -1) return this.listsArr;

            return this.listsArr[itemIndex];

        },
        counter: {
            currentId: 0,
            freeId: []

        },
        getId: function () {
            return this.counter.freeId.length > 0 ? this.counter.freeId.shift() : this.counter.currentId++;

        },
        releaseId: function (id) {
            //add deleted item's id to freeId array of counter
            this.counter.freeId.push(id)
            //sort freeId array (ascending) 
            this.counter.freeId.sort(function (a, b) {
                return a - b;
            });

        },
        handleStorage: function (method) {
            var data, prefix;
            prefix = 'to-do-list.storage.listsHolder';

            if (method === 'SET') {
                data = {
                    listsArr: this.listsArr,
                    listsIndexArr: this.listsIndexArr,
                    couter: this.counter

                };

                storage.removeItem(prefix);
                storage.setItem(prefix, JSON.stringify(data));

            } else if (method === 'GET') {
                data = JSON.parse(storage.getItem(prefix));
                if (data === null) return;

                this.listsArr = data.listsArr || this.listsArr;
                this.listsIndexArr = data.listsIndexArr || this.listsIndexArr;
                this.counter = data.couter || this.counter;

            }

            return data.listsArr;

        }

    };

    getId = function () {
        return listsHolder.counter.getId();

    };

    List = function () {
        this.id = listsHolder.getId();
        this.header = 'TO-DO-LIST';
        this.isOrdered = false;

        //store listItems like Objects 
        //item = {id: Number, value: String}
        this.items = [];
        this.itemsHistory = [];
        //store only item.id for fast Search
        this.itemsIndex = [];
        this.itemsHistoryIndex = [];

        //defining counter
        //it contains currentId (increment), 
        //and array of freeIds
        //deleted item's id goes to freeId array
        this.counter = {
            currentId: 0,
            freeId: []

        };

    };


    List.prototype.getItemId = function () {
        return this.counter.freeId.length > 0 ? this.counter.freeId.shift() : this.counter.currentId++;

    };

    List.prototype.releaseItemId = function (id) {
        //add deleted item's id to freeId array of counter
        this.counter.freeId.push(id)
        //sort freeId array (ascending) 
        this.counter.freeId.sort(function (a, b) {
            return a - b;
        });

    };

    List.prototype.changeHeader = function (newHeader) {
        this.header = newHeader;
        this.handleStorage('SET');

    };

    List.prototype.handleType = function (isOrdered) {
        if (isOrdered !== undefined) {
            this.isOrdered = isOrdered;
            this.handleStorage('SET');
        }

        return this.isOrdered;

    };

    List.prototype.addItem = function (value) {
        var item = {
            id: null,
            value: value
        };

        item.id = this.getItemId();

        this.items.push(item);
        this.itemsIndex.push(item.id);

        this.handleStorage('SET');

        return item.id;

    };

    List.prototype.changeItem = function (id, value, isDone) {
        var itemIndex = this.itemsIndex.indexOf(id);
        if (itemIndex === -1) return;

        if (isDone === true) {
            //arr.splice return array of deleted values
            //so i use arr.splice(id, 1)[0] to select the only deleted element
            //and then i move it to item history
            this.itemsHistory.unshift(this.items.splice(itemIndex, 1)[0]);
            this.itemsHistoryIndex.unshift(this.itemsIndex.splice(itemIndex, 1)[0]);
        } else {
            this.items[itemIndex].value = value;
        }

        this.handleStorage('SET');

    };

    List.prototype.restoreDoneItem = function (id) {
        var itemIndex = this.itemsHistoryIndex.indexOf(id);
        if (itemIndex === -1) return;

        this.items.push(this.itemsHistory.splice(itemIndex, 1)[0]);
        this.itemsIndex.push(this.itemsHistoryIndex.splice(itemIndex, 1)[0]);

        this.handleStorage('SET');

    };

    List.prototype.removeItem = function (id) {
        var itemIndex, itemId;
        itemId = id;
        itemIndex = this.itemsIndex.indexOf(itemId);

        if (itemIndex !== -1) {
            this.items.splice(itemIndex, 1);
            this.itemsIndex.splice(itemIndex, 1);

        } else {
            itemIndex = this.itemsHistoryIndex.indexOf(itemId);
            if (itemIndex === -1) return;

            this.itemsHistory.splice(itemIndex, 1);
            this.itemsHistoryIndex.splice(itemIndex, 1);

        };

        this.releaseItemId(itemId);

        this.handleStorage('SET');

    };

    List.prototype.handleStorage = function (method) {
        var data, storagePrefix;
        storagePrefix = 'to-do-list.storage.list';

        if (method === 'SET') {
            data = {
                id: this.id,
                header: this.header,
                isOrdered: this.isOrdered,
                counter: this.counter,
                items: this.items,
                itemsIndex: this.itemsIndex,
                itemsHistory: this.itemsHistory,
                itemsHistoryIndex: this.itemsHistoryIndex

            };

            storage.removeItem(storagePrefix);
            storage.setItem(storagePrefix, JSON.stringify(data));

        } else if (method === 'GET') {
            data = JSON.parse(storage.getItem(storagePrefix));
            if (data === null) return;

            this.id = data.id;
            this.header = data.header || "TO-DO-LIST";
            this.isOrdered = data.isOrdered || false;
            this.counter = data.counter;
            this.items = data.items || [];
            this.itemsIndex = data.itemsIndex || [];
            this.itemsHistory = data.itemsHistory || [];
            this.itemsHistoryIndex = data.itemsHistoryIndex || [];

        }


    };

    List.prototype.initializeList = function (listObj) {
        this.id = listObj.id;
        this.header = listObj.header;
        this.isOrdered = listObj.isOrdered;

        //store listItems like Objects 
        //item = {id: Number, value: String}
        this.items = listObj.items;
        this.itemsHistory = listObj.itemsHistory;
        //store only item.id for fast Search
        this.itemsIndex = listObj.itemsIndex;
        this.itemsHistoryIndex = listObj.itemsHistoryIndex;

        //defining counter
        //it contains currentId (increment), 
        //and array of freeIds
        //deleted item's id goes to freeId array
        this.counter = listObj.counter;
        this.handleStorage('SET');

    };

    return {
        createNewList: function () {
            return new List();

        },

        saveList: function (listObj) {
            return listsHolder.saveItem(listObj);

        },

        removeList: function (listId) {
            return listsHolder.removeItem(listId);

        },

        getSingleList: function (listId) {
            return listsHolder.getItem(listId);

        },

        getAllLists: function () {
            return listsHolder.handleStorage('GET');

        }

    };

})();

var APP = (function APP_MAIN(UI, DATA) {
    var UIStrings, UIElements,
        setupEventListeners, initVariables, initData,
        counter, currentList, listsSelections;

    initVariables = function initializeVariables() {
        UIStrings = UI.getDOMStrings();
        UIElements = UI.getDOMElements();
        currentList = DATA.createNewList();
        listsSelections = DATA.getAllLists();

    };

    initData = function initializeData() {
        currentList.handleStorage('GET');
        UI.handleListHeader(currentList.header);
        UI.handleListType(currentList.handleType());
        UI.clearToDoAndHistoryLists();

        console.log(currentList.id);

        if (currentList.items.length > 0) {
            currentList.items.forEach(function initializeListItems(el) {
                handleNewListItemElement(el.id, el.value);

            });

        };

        if (currentList.itemsHistory.length > 0) {
            currentList.itemsHistory.forEach(function initializeHistoryListItems(el) {
                handleNewHistoryListElement(el.id, el.value);

            });

        };

        if (listsSelections && listsSelections.length > 0) {
            UI.clearListsSelections();
            listsSelections.forEach(function initializeListsSelectionsElements(el) {
                UI.drawListsSelectionsElement(el.id, el.header);

            });

        }

    };

    setupEventListeners = function setupAppEventListeners() {
        //setup UI event listeners
        UI.setupEventListeners();
        UIElements.toDoListNameEditor.on('keyup', function handleAppListHeaderChange(e) {
            //apply changes only by ENTER key
            if (e.keyCode === 13) {
                var newHeader = UIElements.toDoListNameEditor.val();
                currentList.changeHeader(newHeader);
                UI.handleListHeader(newHeader);

            }

        });

        UIElements.toDoListType.on('change', function handleAppListTypeChange() {
            currentList.handleType(UI.handleListType());

        });

        //add event listener on input change
        UIElements.input.on('keyup', function handleAppInputChange(e) {
            //apply changes only by ENTER key
            if (e.keyCode === 13) {
                var value, id;

                value = UI.getInputValue();
                id = currentList.addItem(value);
                handleNewListItemElement(id, value);
            } else if (e.keyCode === 27) {
                //clear value
                UI.getInputValue();
                UIElements.input.blur();

            }

        });

        UIElements.input.on('blur', function handleAppInputChange(e) {
            //clear value
            UI.getInputValue();
        });

        //add event listeners to lists selections menu (new, save, load, remove)
        UIElements.listsNewBtn.on('click', function () {
            currentList = DATA.createNewList();
            currentList.handleStorage('SET');
            initData();

        });

        UIElements.listsSaveBtn.on('click', function () {
            listsSelections = DATA.saveList(currentList);
            console.log(currentList.id);
            UI.drawListsSelectionsElement(currentList.id, currentList.header);

        });

        UIElements.listsRemoveBtn.on('click', function () {
            var selectedListId;
            selectedListId = Number($('input[name="' + UIStrings.listsSelectionsElementName + '"]:checked').val());

            if (selectedListId >= 0) {
                listsSelections = DATA.removeList(selectedListId);
                UI.clearListsSelections();
                listsSelections.forEach(function initializeListsSelectionsElements(el) {
                    UI.drawListsSelectionsElement(el.id, el.header);

                });

            }

        });

        UIElements.listsLoadBtn.on('click', function () {
            var selectedListId;
            selectedListId = Number($('input[name="' + UIStrings.listsSelectionsElementName + '"]:checked').val());

            if (selectedListId >= 0) {
                currentList = DATA.createNewList();
                currentList.initializeList(DATA.getSingleList(selectedListId));
                currentList.handleStorage('SET');
                initData();

            }

        });

    };

    function handleNewListItemElement(id, value) {
        var itemId, itemValue, listItemObj, itemElement, itemElementId, itemIdNumber, itemElementValue;
        itemId = id;
        itemValue = value;
        listItemObj = UI.createListItemElement(itemId, itemValue);

        listItemObj.listItemRemoveBtn.on('click', function handleAppListItemRemove() {
            //remove DATA item
            currentList.removeItem(itemId);
            //remove DOM element
            UI.removeListItemElement(itemId);

        });

        listItemObj.listItemDoneBtn.on('click', function handleAppListItemDone() {
            //remove DATA item
            currentList.changeItem(itemId, null, true);
            //remove DOM element
            UI.removeListItemElement(itemId);
            //add history DOM element
            handleNewHistoryListElement(currentList.itemsHistory[0].id, currentList.itemsHistory[0].value);

        });

        listItemObj.listItemEditor.on('keyup', function handleAppListItemChange(e) {
            //apply changes only by ENTER key
            if (e.keyCode === 13) {
                itemElementValue = listItemObj.listItemEditor.val();
                currentList.changeItem(itemId, itemElementValue);
                UI.updateListItemElement(itemId, itemElementValue);

            }

        });

    };

    function handleNewHistoryListElement(id, value) {
        var historyListElement, itemId, itemValue;
        itemId = id;
        itemValue = value;
        historyListElement = UI.createHistoryItemElement(itemId, itemValue);

        historyListElement.listItemRemoveBtn.on('click', function handleAppHistoryListItemRemove() {
            //remove DATA history item
            currentList.removeItem(itemId);
            //remove DOM element
            UI.removeListItemElement(itemId);

        });

        historyListElement.listItemUnDoneBtn.on('click', function handleAppHistoryListUnDone() {
            //move DATA history item 
            currentList.restoreDoneItem(itemId);
            //remove UI history list element
            UI.removeListItemElement(itemId);
            //create UI to-do list element
            handleNewListItemElement(itemId, itemValue);

        });

    };

    return {
        initializeApp: function initializeApplication() {
            initVariables();
            initData();
            setupEventListeners();

        },
        currentList: function () {
            return currentList;
        },
    }

})(UI, DATA);

APP.initializeApp();
