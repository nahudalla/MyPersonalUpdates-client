(function () {
const PARTIAL_TYPE = 'PartialAttributeFilter';
const EXACT_TYPE = 'ExactAttributeFilter';
const NOT_TYPE = 'NotFilter';
const OR_TYPE = 'OrFilter';
const AND_TYPE = 'AndFilter';
const RENDERED_TYPE = 'RENDERIZED';
const ATTRIBUTE_FORM = 7777777;

window.FilterForm = new (class {
    async render(container, filterData) {
        filterData = filterData || {type: PARTIAL_TYPE};

        switch (filterData.type) {
            case RENDERED_TYPE: container.append(filterData.element); break;
            case NOT_TYPE: await renderNot(filterData, container); break;
            case OR_TYPE:
            case AND_TYPE: await renderAndOr(filterData, container); break;
            case PARTIAL_TYPE:
            case EXACT_TYPE:
            default: await renderPartialOrExact(filterData, container);
        }
    }

    toJSON(container) {
        return processChildren(container, {}).filter;
    }
});

function processChildren(container, origContext, innerFilters) {
    innerFilters = innerFilters || [];

    let context = Object.assign({}, origContext);

    if(!context.__top)
        context.__top = container;

    for(let child of container.children()) {
        child = $(child);
        if(child.is('fieldset')) {
            innerFilters.push(processChildren(child, {type : child.data('type')}));
        } else if(child.is('form')) {
            processForm(child, context);
        } else {
            processChildren(child, context, innerFilters);
        }
    }

    if(context.__top === container) {
        delete context.__top;

        if(typeof context.exact === "boolean") {
            if(context.exact) {
                context.type = 'Exact'+context.type;
            }else {
                context.type = 'Partial'+context.type;
            }
            delete context.exact;
        }

        if (innerFilters.length === 1)
            context.filter = innerFilters[0];
        else {
            for (let i = 0; i < innerFilters.length; i++) {
                context[`filter${i + 1}`] = innerFilters[i];
            }
        }

        const negated = context.negated;
        delete context.negated;

        if(negated) {
            context = {
                type: NOT_TYPE,
                filter: context
            };
        }
    }

    return Object.assign(origContext, context);
}

function processForm(container, context) {
    for(let input of container.find('input')) {
        input = $(input);

        if(input.prop('type') !== 'radio' || input.is(':checked'))
            context[input.prop('name')] = input.prop('type') === 'checkbox' ? input.is(':checked') : input.val();
    }

    for(let select of container.find('select')) {
        select = $(select);

        context[select.prop('name')] = select.val();
    }

    if(typeof context.attrID === "string" && typeof context.providerID === "string") {
        context.attr = {
            attrID: parseInt(context.attrID),
            providerID: parseInt(context.providerID)
        };

        delete context.attrID;
        delete context.providerID;
    }

    if(typeof context.value === "string" && context.value === "")
        throw new Exception('Ingrese un valor.');
}

async function renderAndOr(data, container) {
    const group = $(document.createElement('fieldset'));
    const legend = $(document.createElement('legend'));
    group.append(legend);

    if(data.type === AND_TYPE) {
        group.data('type', 'AndFilter');
        legend.text('AND');
    } else {
        group.data('type', 'OrFilter');
        legend.text('OR');
    }

    // FORM
    const form = $(document.createElement('form'));
    form.on('submit', e => e.preventDefault());
    group.append(form);

    {
        // NEGATED
        const negated = $(document.createElement('input'));
        negated.prop('type', 'checkbox');
        negated.prop('name', 'negated');
        negated.prop('checked', data.negated && data.negated === true);

        let label = $(document.createElement('label'));
        label.append(negated);
        label.append($('<span>&nbsp;Negado</span>'));

        form.append(label);
    }

    await FilterForm.render(group, data.filter1);
    await FilterForm.render(group, data.filter2);

    container.append(group);
}

function renderNot(data, container) {
    data.filter.negated = true;

    return FilterForm.render(container, data.filter);
}

async function renderPartialOrExact(data, container) {
    data = data || {};

    // GROUP
    const group = $(document.createElement('fieldset'));
    group.data('type', 'AttributeFilter');

    {
        // LEGEND
        const legend = $(document.createElement('legend'));
        legend.append('<span>Atributo&nbsp;</span>');

        group.append(legend);
    }

    {
        // GROUPING
        group.append('<div>Envolver con:</div>');
        const ANDBtn = $(document.createElement('button'));
        ANDBtn.text('AND');
        ANDBtn.on('click', genHandler(AND_TYPE));

        group.append(ANDBtn);

        const ORBtn = $(document.createElement('button'));
        ORBtn.text('OR');
        ORBtn.on('click', genHandler(OR_TYPE));

        group.append(ORBtn);

        function genHandler(type) {
            return function () {
                const div = $(document.createElement('div'));
                group.before(div);
                group.detach();
                FilterForm.render(div, {
                    type: type,
                    filter1: {
                        type: RENDERED_TYPE,
                        element: group
                    }
                });
            }
        }
    }

    group.append('<br>');
    group.append('<br>');

    // FORM
    const form = $(document.createElement('form'));
    form.data('type', ATTRIBUTE_FORM);
    form.on('submit', e => e.preventDefault());
    group.append(form);

    {
        // NEGATED
        const negated = $(document.createElement('input'));
        negated.prop('type', 'checkbox');
        negated.prop('name', 'negated');
        negated.prop('checked', data.negated && data.negated === true);

        let label = $(document.createElement('label'));
        label.append(negated);
        label.append($('<span>&nbsp;Negado</span>'));

        form.append(label);
    }

    {
        // EXACT MATCHING
        const exactCheck = $(document.createElement('input'));
        exactCheck.prop('type', 'checkbox');
        exactCheck.prop('name', 'exact');

        if (data.type && data.type === EXACT_TYPE) {
            exactCheck.prop('checked', true);
        } else {
            exactCheck.prop('checked', false);
        }

        const label = $(document.createElement('label'));
        label.append(exactCheck);
        label.append($('<span>&nbsp;Búsqueda exacta</span>'));

        form.append(label);
    }

    form.append('<br>');

    {
        // Attribute
        const providerSelector = $(document.createElement('select'));
        providerSelector.prop('name', 'providerID');

        const availableProviders = await Provider.availableProviders;

        let select = data.attr ? data.attr.providerID || null : null;

        for(let provider of availableProviders) {
            const opt = $(document.createElement('option'));
            opt.prop('value', provider.id);
            opt.text((await provider.info).name);

            if(provider.id === select) {
                opt.prop('selected', 'selected');
                select = null;
            }

            providerSelector.append(opt);
        }

        if(select !== null)
            throw new Exception('El filtro contiene un atributo de un proveedor que no está diponible.');

        const label = $(document.createElement('label'));
        label.append(`<span>Proveedor:&nbsp;</span>`);
        label.append(providerSelector);

        form.append(label);

        form.append('<br>');

        form.append('<div>Atributo:</div>');

        const attrOptionsContainer = $(document.createElement('div'));
        form.append(attrOptionsContainer);

        async function updateAttrOptions(select) {
            attrOptionsContainer.html('');

            const provider = Provider.getProviderByID(parseInt(providerSelector.val()));
            for(let attr of await provider.attributes) {
                if(select === null) select = attr.attrID;

                const label = $(document.createElement('label'));
                label.prop('title', `${attr.description}

Nota: ${attr.filterNotes}`);

                const radio = $(document.createElement('input'));
                radio.prop('type', 'radio');
                radio.prop('name', 'attrID');
                radio.prop('value', attr.attrID);

                if(attr.attrID === select)
                    radio.prop('checked', 'checked');

                label.append(radio);
                label.append(`<span>&nbsp;${attr.name}</span>`);
                attrOptionsContainer.append(label);
            }
        }

        providerSelector.on('change', updateAttrOptions);

        if(providerSelector.val())
            await updateAttrOptions(data.attr ? data.attr.attrID || null : null);
    }

    form.append('<br>');

    {
        // Value
        const value = $(document.createElement('input'));
        value.prop('name', 'value');
        value.prop('type', 'text');

        if(typeof data.value === "string")
            value.prop('value', data.value);

        const label = $(document.createElement('label'));
        label.append($('<span>Valor:&nbsp;</span>'));
        label.append(value);

        form.append(label);
    }

    container.append(group);
}
})();