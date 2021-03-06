/*global define*/

define(function () {
    'use strict';

    function EntryFormatter($filter) {
        this.formatDate = function (format) {
            return function (date) {
                return $filter('date')(date, format);
            };
        };
    }

    EntryFormatter.prototype.formatField = function formatField(field) {
        var label = field.label() || field.name();

        switch (field.type()) {
            case 'boolean':
            case 'choice':
            case 'choices':
            case 'number':
            case 'float':
            case 'string':
            case 'text':
            case 'wysiwyg':
            case 'email':
            case 'json':
            case 'file':
            case 'template':
                return function (entry) {
                    return {
                        name: label,
                        value: entry.values[field.name()]
                    };
                };
            case 'datetime':
            case 'date':
                var formatDate = this.formatDate(field.format());
                return function (entry) {
                    return {
                        name: label,
                        value: formatDate(entry.values[field.name()])
                    };
                };
            case 'reference':
                return function (entry) {
                    return {
                        name: label,
                        value: entry.listValues[field.name()]
                    };
                };
            case 'referenced_many':
            case 'referenced_list':
                return; //ignored
        }
    };

    EntryFormatter.prototype.getFormatter = function getFormatter(fields) {
        var fieldsFormatters = fields.map(this.formatField.bind(this));

        return function formatEntry(entry) {
            var result = {};
            fieldsFormatters.map(function (formatter) {
                if (!formatter) return;
                return formatter(entry);
            })
            .forEach(function (field) {
                if (!field) return;
                result[field.name] = field.value;
            });

            return result;
        };
    };

    EntryFormatter.$inject = ['$filter'];

    return EntryFormatter;
});
