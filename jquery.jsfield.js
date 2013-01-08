/*
* jquery.jsfield.js
* jQuery Field Plugin
* http://duncanmcintyre.net/plugins/jsfield-1-1/
*
* Copyright (c) 2011 Duncan McIntyre http://duncanmcintyre.net
* Version 1.1
* Dual licensed under the MIT and GPL licenses.
*
* Release Notes:
* Added support for callbacks:
* - onError
* - onSuccess
* - onMaxLength
* - onMinLength
*
* Fixed copy/paste bug for firefox.
*
*/

(function ($) {
    $.fn.jsfield = function (options) {
        var settings = {
            type: 'default',
            maxLength: null,
            minLength: null,
            initMessage: '',
            errorMessage: '',
            successMessage: '',
            minLengthMessage: 'Enter at least ' + options.minLength + ' chracters.',
            maxLengthMessage: 'You can only enter upto ' + options.maxLength + ' characters.',
            dateFormat: 'm/d/yy',
            dateSeparator: '/',
            hourMasking: false,
            mandatory: false,
            capslock: false,
            action: "",
            className: "jsfield_invalid",
            onMaxLength: null,
            onMinLength: null,
            onError: null,
            onSuccess: null
        };

        var flag = {
            capsIsOn: null,
            capsIsOff: null,
            ctrlKey: false
        };

        var init = {
            field: function (fld, settings) {
                if (settings.action == "") {
                    message.init(fld, settings);
                    $(fld).keypress(function (e) {
                        listenField(fld, e);
                    });
                    $(fld).blur(function (e) {
                        listenField(fld, e);
                    });
                    $(fld).change(function (e) {
                        listenField(fld, e);
                    });
                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });
                }
                else if (settings.action == "validate") {
                    validate.field(fld, settings);
                }

                listenField = function (fld, e) {
                    var fldValue = fld.value.toString();
                    var inValidFlag = 0;

                    if (e.type == "blur") {
                        validate.field(fld, settings);
                        return;
                    }
                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                    methods.onMinLength(fld, settings, e);
                    methods.onMaxLength(fld, settings, e);
                }
            },
            numeric: function (fld, settings) {
                if (settings.action == "") {
                    message.init(fld, settings);
                    $(fld).keypress(function (e) {
                        var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                        var mString = mChar.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                        if (flag.ctrlKey)
                            return true;
                        listenNumeric(fld, mString, e);
                    });
                    $(fld).blur(function (e) {
                        var fldValue = fld.value.toString();
                        var mString = fldValue.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                        listenNumeric(fld, mString, e);
                    });
                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });
                }
                else if (settings.action == "validate") {
                    validate.numeric(fld, settings);
                }

                listenNumeric = function (fld, mString, e) {
                    var fldValue = fld.value.toString();
                    var inValidFlag = 0;

                    //restrict alpha and special characters
                    if (mString != null && e.type != "blur" && e.which != 0) {
                        if (isNaN(parseInt(mString))) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }
                    else if (mString != null && e.type == "blur") {
                        validate.numeric(fld, settings);
                        return;
                    }

                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                    methods.onMinLength(fld, settings, e);
                    methods.onMaxLength(fld, settings, e);
                }
            },
            decimal: function (fld, settings) {
                if (settings.action == "") {
                    message.init(fld, settings);
                    $(fld).keypress(function (e) {
                        var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                        var mString = mChar.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                        if (flag.ctrlKey)
                            return true;
                        listenDecimal(fld, mString, e);
                    });
                    $(fld).blur(function (e) {
                        var fldValue = fld.value.toString();
                        var mString = fldValue.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                        listenDecimal(fld, mString, e);
                    });
                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });
                }
                else if (settings.action == "validate") {
                    validate.decimal(fld, settings);
                }

                listenDecimal = function (fld, mString, e) {
                    var fldValue = fld.value.toString();
                    var inValidFlag = 0;

                    //restrict decimal point if the field already has a decimal point 
                    if (fldValue.indexOf('.') > -1 && mString == ".") {
                        inValidFlag += 1;
                        e.preventDefault();
                    }
                    //allow two decimal places only
                    if (fldValue.indexOf('.') > -1 && e.which != 0) {
                        var sValue = fldValue.split('.');
                        if (e.type == "keypress" && sValue[1].toString().length > 1) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                        else if (e.type == "blur" && sValue[1].toString().length > 2) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }
                    //restrict alpha and special characters
                    if (mString != null && e.type != "blur" && e.which != 0) {
                        if (isNaN(parseInt(mString)) && mString != ".") {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }
                    else if (mString != null && e.type == "blur") {
                        validate.decimal(fld, settings);
                        return;
                    }

                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                    methods.onMinLength(fld, settings, e);
                    methods.onMaxLength(fld, settings, e);
                }
            },
            hour: function (fld, settings) {
                //settings.maxLength = 5;
                settings.maxLengthMessage = "";
                if (settings.action == "") {
                    message.init(fld, settings);
                    if (settings.hourMasking) {
                        $(fld).keypress(function (e) {
                            var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                            var mString = mChar.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                            if (flag.ctrlKey)
                                return true;
                            listenToHour_Advance(fld, mString, e);
                        });
                        $(fld).keydown(function (e) {
                            var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                            var mString = mChar.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                            listenToHour_Advance(fld, mString, e);
                        });
                    }
                    else {
                        $(fld).keypress(function (e) {
                            var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                            var mString = mChar.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                            if (flag.ctrlKey)
                                return true;
                            listenToHour_Basic(fld, mString, e);
                        });
                    }

                    $(fld).blur(function (e) {
                        var fldValue = fld.value.toString();
                        var mString = fldValue.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                        validate.hour(fld, settings);
                    });

                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });
                }
                else if (settings.action == "validate") {
                    validate.hour(fld, settings);
                }

                listenToHour_Basic = function (fld, mString, e) {
                    var selectionText = methods.getSelection(fld);

                    if (e.which == 8)
                        return false;

                    var fldValue = fld.value.toString();
                    var inValidFlag = 0;

                    //restrict point if the field already has a point 
                    if (fldValue.indexOf('.') > -1 && mString == "." && e.which != 0 && selectionText != fldValue) {
                        inValidFlag += 1;
                        e.preventDefault();
                    }

                    //allow two decimal places only
                    if (fldValue.indexOf('.') > -1 && e.which != 0) {
                        var sValue = fldValue.split('.');
                        if (e.type == "keypress" && sValue[1].toString().length > 1 && selectionText != fldValue) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                        else if (e.type == "blur" && sValue[1].toString().length > 2) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }

                    //restrict alpha and special characters
                    if (mString != null && e.which != 0) {
                        if (isNaN(parseInt(mString)) && mString != ".") {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }

                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                    methods.onMinLength(fld, settings, e);
                    methods.onMaxLength(fld, settings, e);
                }

                listenToHour_Advance = function (fld, mString, e) {
                    var fldValue = fld.value.toString();
                    var fldValueArr = fldValue.split(".");
                    var inValidFlag = 0;

                    if (document.getSelection) {
                        // non IE
                        var selectionText = fldValue.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
                        var selectionPos;
                        selectionPos = fld.selectionStart;
                        var selectionLength = selectionText.length;
                        var attemptedValue = "";
                    } else if (document.selection && document.selection.createRange) {
                        // IE
                        var selectionRange = document.selection.createRange();
                        var selectionPos = fld.value.indexOf(selectionRange.text);
                        var selectionText = selectionRange.text;
                        var selectionLength = selectionText.length;
                        var attemptedValue = "";

                        if (e.type != "blur")
                            fld.focus();
                        selectionRange.moveStart('character', -fld.value.length);
                        if (selectionText != "")
                            selectionPos = selectionRange.text.length - 1;
                        else
                            selectionPos = selectionRange.text.length;
                    }

                    if (e.type == "keydown") {
                        if ((e.which == 8 && fldValue.substring(selectionPos, selectionPos - 1) == ".") || selectionText == ".") {
                            $(fld).val(fldValue.substring(0, selectionPos - 1));
                            e.preventDefault();
                        }
                        else if ((e.which == 46 && fldValue.substring(selectionPos, selectionPos + 1) == ".") || selectionText == ".") {
                            $(fld).val(fldValue.substring(0, selectionPos));
                            e.preventDefault();
                        }
                    }
                    else if (e.type == "keypress") {
                        //restrict invalid inputs [if selection contains a decimal point,if selection is a decimal point]
                        if ((selectionText != fldValue) && (selectionText.indexOf(".") != -1 || (selectionText != "" && mString == ".") || (fldValue.indexOf('.') > -1 && mString == ".")) && (e.which != 0) && (e.which == 8)) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                        else {
                            //if one digit is selected
                            if (selectionText.length == 1) {
                                if (selectionPos == 0)
                                    attemptedValue = mString + fldValue.substring(selectionLength, fldValue.length);
                                else if (selectionPos == 1)
                                    attemptedValue = fldValue.substring(0, 1) + mString + fldValue.substring(selectionLength + selectionPos, fldValue.length);
                                else if (selectionPos == 3)
                                    attemptedValue = fldValue.substring(0, 2) + "." + mString + fldValue.substring(selectionLength + selectionPos, fldValue.length);
                            }
                            //if two digits are selected
                            else if (selectionText.length == 2) {
                                attemptedValue = fldValue.replace(selectionText, mString);
                            }
                            // there is no selection
                            else if (selectionText.length == 0) {
                                //if hours place is two digits
                                if (fldValue.indexOf(".") == 2) {
                                    if (selectionPos == 0)
                                        attemptedValue = mString + fldValue.substring(0, 1) + "." + fldValue.substring(3, 2);
                                    if (selectionPos == 1)
                                        attemptedValue = fldValue.substring(0, 1) + mString + "." + fldValue.substring(3, 2);
                                    if (selectionPos == 3)
                                        attemptedValue = fldValue.substring(0, 2) + "." + mString + fldValue.substring(3, 4);
                                    if (selectionPos == 4)
                                        attemptedValue = fldValue.substring(0, 4) + mString;
                                }
                                //if hours place is one digit
                                else if (fldValue.indexOf(".") == 1) {
                                    if (selectionPos == 0)
                                        attemptedValue = mString + fldValue.substring(0, 1) + "." + fldValue.substring(3, 2);
                                    if (selectionPos == 1)
                                        attemptedValue = fldValue.substring(0, 1) + mString + "." + fldValue.substring(3, 2);
                                    if (selectionPos == 2)
                                        attemptedValue = fldValue.substring(0, 1) + "." + mString + fldValue.substring(2, 3);
                                    if (selectionPos == 3)
                                        attemptedValue = fldValue.substring(0, 4) + mString;
                                }
                                else if (fldValue.indexOf(".") == -1) {
                                    attemptedValue = fldValue.substring(0, 4) + mString;
                                }
                            }

                            //validate for a valid attempted value
                            var attemptedValueArr = attemptedValue.split(".");

                            if (attemptedValueArr.length > 1) {
                                if (parseInt(attemptedValueArr[0]) > 23 && parseInt(attemptedValueArr[1]) > 0) {
                                    inValidFlag += 1;
                                    e.preventDefault();
                                }
                                if (parseInt(attemptedValueArr[0]) < 24 && parseInt(attemptedValueArr[1]) > 59) {
                                    inValidFlag += 1;
                                    e.preventDefault();
                                }
                                if (parseInt(attemptedValueArr[0]) > 24) {
                                    inValidFlag += 1;
                                    e.preventDefault();
                                }
                            }
                            else if (parseInt(attemptedValueArr[0]) > 24) {
                                inValidFlag += 1;
                                e.preventDefault();
                            }
                        }

                        //if first input is a point add 0 before it                    
                        if (fldValue.length == 0 && mString == "." && e.which != 0) {
                            $(fld).val("0" + fldValue); //$(fld).val("00" + fldValue);
                        }

                        //if second input is a point add zero before the first value (temporarily commented)
                        if (fldValue.length == 1 && mString == "." && e.which != 0) {
                            $(fld).val(fldValue); //$(fld).val("0"+fldValue);
                        }

                        //if the first two digits in the field is equal to 24 and the current input is a point
                        if (parseInt(fldValue.substring(0, 2)) == 24 && fldValue.substr(3, 2) == "" && mString == "." && e.which != 0) {
                            $(fld).val(fldValue + mString + "00");
                            e.preventDefault();
                        }

                        //if hours is equal to 24 and minutes is empty and current input is greater than 0
                        if (parseInt(fldValue.substr(0, 2)) == 24 && fldValue.substr(3, 2) == "" && parseInt(mString) > 0 && e.which != 0) {
                            if (fldValue.indexOf('.') > -1)
                                $(fld).val(fldValue + "00");
                            else
                                $(fld).val(fldValue + ".00");
                            e.preventDefault();
                        }

                        //restrict input if the field already has a decimal point and the current input value is a decimal point (one decimal point is allowed)
                        if (fldValue.indexOf('.') > -1 && mString == ".") {
                            inValidFlag += 1;
                            e.preventDefault();
                        }

                        //allow two decimal places only
                        if (fldValue.indexOf('.') > -1 && e.which != 0) {
                            var sValue = fldValue.split('.');
                            if (e.type == "keypress" && sValue[1].toString().length > 1 && parseInt(fldValue.substr(0, 2)) > 24) {
                                inValidFlag += 1;
                                e.preventDefault();
                            }
                            else if (e.type == "blur" && sValue[1].toString().length > 2) {
                                inValidFlag += 1;
                                e.preventDefault();
                            }
                        }

                        //restrict alpha and special characters
                        if (mString != null && e.which != 0) {
                            if (isNaN(parseInt(mString)) && mString != ".") {
                                inValidFlag += 1;
                                e.preventDefault();
                            }
                        }
                    }
                    else if (e.type == "blur") {
                        validate.hour(fld, settings);
                        //methods.onMaxLength(fld, settings, e);
                        return;
                    }

                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0));
                    methods.onMaxLength(fld, settings, e);
                }
            },
            alpha: function (fld, settings) {
                if (settings.action == "") {
                    message.init(fld, settings);
                    $(fld).keypress(function (e) {
                        var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                        var mString = mChar.match(/[~`!@#$%^&*({})-_=+:;"',?|]/);
                        var nString = mChar.match(/[0-9]/);
                        listenAlpha(fld, mString, nString, e);
                    });
                    $(fld).blur(function (e) {
                        var fldValue = fld.value.toString();
                        var mString = fldValue.match(/[~`!@#$%^&*({})-_=+:;"',?|]/);
                        var nString = fldValue.match(/[0-9]/);
                        listenAlpha(fld, mString, nString, e);
                    });
                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });
                }
                else if (settings.action == "validate") {
                    validate.alpha(fld, settings);
                }

                listenAlpha = function (fld, mString, nString, e) {
                    var inValidFlag = 0;

                    //restrict special characters
                    if (mString != null && e.type != "blur" && e.which != 0) {
                        if (isNaN(parseInt(mString))) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }
                    //restrict numbers
                    if (nString != null && e.type != "blur" && e.which != 0) {
                        if (!isNaN(parseInt(nString))) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }

                    if (e.type == "blur") {
                        validate.alpha(fld, settings);
                        return;
                    }

                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                    methods.onMinLength(fld, settings, e);
                    methods.onMaxLength(fld, settings, e);
                }
            },
            alphanumeric: function (fld, settings) {
                if (settings.action == "") {
                    message.init(fld, settings);
                    $(fld).keypress(function (e) {
                        var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                        var mString = mChar.match(/[~`!@#$%^&*({})-_=+:;"',?|]/);
                        lsitenAlphaNumeric(fld, mString, e);
                    });
                    $(fld).blur(function (e) {
                        var fldValue = fld.value.toString();
                        var mString = fldValue.match(/[~`!@#$%^&*({})-_=+:;"',?|]/);
                        lsitenAlphaNumeric(fld, mString, e);
                    });
                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });
                }
                else if (settings.action == "validate") {
                    validate.alphanumeric(fld, settings);
                }

                lsitenAlphaNumeric = function (fld, mString, e) {
                    var inValidFlag = 0;

                    //restrict special characters
                    if (mString != null && e.type != "blur" && e.which != 0) {
                        if (isNaN(parseInt(mString))) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }
                    else if (e.type == "blur") {
                        validate.alphanumeric(fld, settings);
                        return;
                    }

                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                    methods.onMinLength(fld, settings, e);
                    methods.onMaxLength(fld, settings, e);
                }
            },
            email: function (fld, settings) {
                if (settings.action == "") {
                    var fldValue = fld.value.toString();
                    message.init(fld, settings);
                    $(fld).keypress(function (e) {
                        var inValidFlag = 0;
                        message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                        methods.onMinLength(fld, settings, e);
                        methods.onMaxLength(fld, settings, e);
                    });
                    $(fld).blur(function (e) {
                        validate.email(fld, settings);
                    });
                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });
                }
                else if (settings.action == "validate") {
                    validate.email(fld, settings);
                }
            },
            date: function (fld, settings) {
                if (settings.action == "") {
                    var fldValue = fld.value.toString();
                    message.init(fld, settings);
                    $(fld).keypress(function (e) {
                        var mChar = e.keyCode ? String.fromCharCode(e.keyCode) : String.fromCharCode(e.charCode);
                        var mString = mChar.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                        if (flag.ctrlKey)
                            return true;
                        listenDate(fld, mString, e);
                    });
                    $(fld).blur(function (e) {
                        validate.date(fld, settings);
                    });
                    $(fld).click(function (e) { methods.onFieldClick(fld, settings); });

                }
                else if (settings.action == "validate") {
                    validate.date(fld, settings);
                }

                listenDate = function (fld, mString, e) {
                    var fldValue = fld.value.toString();
                    var inValidFlag = 0;

                    //restrict alpha and special characters
                    if (mString != null && e.type != "blur" && e.which != 0) {
                        if (isNaN(parseInt(mString)) && mString != settings.dateSeparator) {
                            inValidFlag += 1;
                            e.preventDefault();
                        }
                    }
                    else if (mString != null && e.type == "blur") {
                        validate.date(fld, settings);
                        return;
                    }

                    //validate against settings
                    message.toggle(fld, settings, Boolean(inValidFlag == 0), e);
                    methods.onMinLength(fld, settings, e);
                    methods.onMaxLength(fld, settings, e);
                }
            }
        }

        var validate = {
            field: function (fld, settings) {
                var fldValue = fld.value.toString();
                var inValidFlag = 0;

                message.toggle(fld, settings, Boolean(inValidFlag == 0));
                methods.onMinLength(fld, settings);
                methods.onMaxLength(fld, settings);
            },
            numeric: function (fld, settings) {
                var fldValue = fld.value.toString();
                var mString = fldValue.match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                var inValidFlag = 0;

                if (!isFinite(mString.input) || isNaN(parseInt(mString))) {
                    inValidFlag += 1;
                }

                message.toggle(fld, settings, Boolean(inValidFlag == 0));
                methods.onMinLength(fld, settings);
                methods.onMaxLength(fld, settings);
            },
            decimal: function (fld, settings) {
                var fldValue = fld.value.toString();
                var mString = fldValue.replace(".", "").match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                var inValidFlag = 0;

                if (!isFinite(mString.input) || isNaN(parseInt(mString)) || (fldValue.indexOf(".") > -1)) {
                    inValidFlag += 1;
                }

                message.toggle(fld, settings, Boolean(inValidFlag == 0));
                methods.onMinLength(fld, settings);
                methods.onMaxLength(fld, settings);
            },
            hour: function (fld, settings) {
                var fldValue = fld.value.toString();
                var fldValueArr = fldValue.split(".");
                var mString = fldValue.replace(".", "").match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);
                var inValidFlag = 0;

                if (fldValueArr.length > 1 && fldValueArr.length < 3) {
                    if (isFinite(fldValueArr[0]) && isFinite(fldValueArr[1])) {
                        if (parseInt(fldValueArr[0]) > 23 && parseInt(fldValueArr[1]) > 0) {
                            inValidFlag += 1;
                        }
                        if (parseInt(fldValueArr[0]) < 24 && parseInt(fldValueArr[1]) > 59) {
                            inValidFlag += 1;
                        }
                        if (parseInt(fldValueArr[0]) > 24) {
                            inValidFlag += 1;
                        }
                    }
                    else {
                        inValidFlag += 1;
                    }
                }
                else if (fldValueArr.length > 2) {
                    inValidFlag += 1;
                }
                else if (isFinite(fldValueArr[0])) {
                    if (parseInt(fldValueArr[0]) > 24) {
                        inValidFlag += 1;
                    }
                }
                else {
                    inValidFlag += 1;
                }

                message.toggle(fld, settings, Boolean(inValidFlag == 0));
            },
            alpha: function (fld, settings) {
                var fldValue = fld.value.toString();
                var mString = fldValue.match(/[~`!@#$%^&*({})-_=+:;"',?|]/);
                var nString = fldValue.match(/[0-9]/);
                var inValidFlag = 0;

                //restrict special characters
                if (mString != null) {
                    if (isNaN(parseInt(mString))) {
                        inValidFlag += 1;
                    }
                }
                //restrict numbers
                if (nString != null) {
                    if (!isNaN(parseInt(nString))) {
                        inValidFlag += 1;
                    }
                }

                message.toggle(fld, settings, Boolean(inValidFlag == 0));
                methods.onMinLength(fld, settings);
                methods.onMaxLength(fld, settings);
            },
            alphanumeric: function (fld, settings) {
                var fldValue = fld.value.toString();
                var mString = fldValue.match(/[~`!@#$%^&*({})-_=+:;"',?|]/);
                var inValidFlag = 0;

                if (mString != null) {
                    if (isNaN(parseInt(mString))) {
                        inValidFlag += 1;
                    }
                }

                message.toggle(fld, settings, Boolean(inValidFlag == 0));
                methods.onMinLength(fld, settings);
                methods.onMaxLength(fld, settings);
            },
            email: function (fld, settings) {
                var fldValue = fld.value.toString();
                var sVal;

                tvalAT = fldValue.indexOf("@");
                tvalDOT = fldValue.lastIndexOf(".");
                sVal = fldValue.indexOf(' ');
                var inValidFlag = 0;
                if (tvalAT == -1 || tvalDOT == -1)
                    inValidFlag += 1;
                if (tvalDOT < tvalAT)
                    inValidFlag += 1;
                if (tvalDOT - tvalAT == 1)
                    inValidFlag += 1;
                if (tvalDOT == (fldValue.length - 1))
                    inValidFlag += 1;
                if (sVal >= 0)
                    inValidFlag += 1;

                if (fldValue == "" && !settings.mandatory)
                    inValidFlag = 0;

                message.toggle(fld, settings, Boolean(inValidFlag == 0));
                methods.onMinLength(fld, settings);
                methods.onMaxLength(fld, settings);
            },
            date: function (fld, settings) {
                var inValidFlag = 0;

                switch (settings.dateFormat) {
                    case "m/d/yy":
                        var fldValue = fld.value.toString();
                        var fldValueSplit = fldValue.split(settings.dateSeparator);
                        var mString = fldValue.replace("/", "").match(/[a-z ~`!@#$%^&*({})-_=+:;"',?|]/);

                        if (fldValueSplit.length == 3) {
                            //validate month
                            if (parseInt(fldValueSplit[0]) > 12) {
                                inValidFlag += 1;
                            }

                            //validate days of month
                            if (fldValueSplit[1] != "") {
                                var yearIn = parseInt(fldValueSplit[2]);
                                var monthIn = parseInt(fldValueSplit[0]);
                                var daysFound = new Date(yearIn, monthIn, 0);
                                if (parseInt(fldValueSplit[1]) > daysFound.getDate()) {
                                    inValidFlag += 1;
                                }
                            }

                            //validate year
                            if (fldValueSplit[2] != "" && (parseInt(fldValueSplit[2]) > 9999 || parseInt(fldValueSplit[2]) < 1753)) {
                                inValidFlag += 1;
                            }

                            if (!isFinite(mString)) {
                                inValidFlag += 1;
                            }
                        }
                        else if (fldValueSplit.length != 3 && fldValue != "")
                            inValidFlag += 1;
                        else if (settings.mandatory && fldValue == "")
                            inValidFlag += 1;
                        break;
                }
                message.toggle(fld, settings, Boolean(inValidFlag == 0));
                methods.onMinLength(fld, settings);
                methods.onMaxLength(fld, settings);
            }
        }

        var message = {
            init: function (fld, settings) {
                if (settings.mandatory) {
                    message.remove(fld);
                    if (settings.initMessage != "")
                        $(fld).after("<span class=\"jsfield_init\"> " + settings.initMessage + " </span>");
                }
            },
            toggle: function (fld, settings, isvalid, e) {
                var fldValue = fld.value;
                if (isvalid) {
                    message.remove(fld);
                    if (settings.successMessage != "")
                        $(fld).after("<span class=\"jsfield_success\"> " + settings.successMessage + "</span>");
                    $(fld).removeClass(settings.className);
                    $(fld).attr("jsfield_isValid", true);
                    if (settings.onSuccess != null)
                        settings.onSuccess.call(fld);
                }
                else if (!isvalid) {
                    message.remove(fld);
                    if (settings.errorMessage != "")
                        $(fld).after("<span class=\"jsfield_error\"> " + settings.errorMessage + "</span>");
                    $(fld).addClass(settings.className);
                    $(fld).attr("jsfield_isValid", false);
                    if (settings.onError != null)
                        settings.onError.call(fld);
                }
                if (e && e.type == "blur" && isvalid && settings.mandatory && fld.value == "") {
                    message.remove(fld);
                    if (settings.initMessage != "")
                        $(fld).after("<span class=\"jsfield_init\"> " + settings.initMessage + "</span>");
                }

                if (settings.mandatory && fld.nodeName.toLowerCase() != "select" && fldValue == "") {
                    $(fld).addClass(settings.className);
                    $(fld).attr("jsfield_isValid", false);
                    if (settings.onError != null)
                        settings.onError.call(fld);
                }
                else if (settings.mandatory && fld.nodeName.toLowerCase() === "select" && (fldValue == -1 || fldValue == "")) {
                    $(fld).addClass(settings.className);
                    $(fld).attr("jsfield_isValid", false);
                    if (settings.onError != null)
                        settings.onError.call(fld);
                }
                if (e != undefined && settings.capslock && e.type == "keypress") {
                    methods.checkCaps(fld, settings, e);
                }
            },
            remove: function (fld) {
                $(fld).next(".jsfield_init").remove();
                $(fld).next(".jsfield_success").remove();
                $(fld).next(".jsfield_error").remove();
                $(fld).next(".jsfield_min").remove();
                $(fld).next(".jsfield_max").remove();
                $(fld).attr("jsfield_isValid", true);
            }
        }

        var methods = {
            getSelection: function (fld) {
                var fldValue = fld.value.toString();
                if (document.getSelection) {
                    // non IE                    
                    var selectionText;
                    if (document.getSelection() == "")
                        selectionText = "";
                    else
                        selectionText = fldValue.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
                } else if (document.selection && document.selection.createRange) {
                    // IE
                    var selectionRange = document.selection.createRange();
                    var selectionText = selectionRange.text;
                }
                return selectionText;
            },
            checkCaps: function (fld, settings, e) {
                var theKeyCode = 0;
                var theShiftKey = e.shiftKey;

                if (document.all) {
                    theKeyCode = e.keyCode;
                } else if (document.getElementById) {
                    theKeyCode = e.which;
                }

                if ((theKeyCode >= 65 && theKeyCode <= 90) || (theKeyCode >= 97 && theKeyCode <= 122)) {
                    if (((theKeyCode >= 65 && theKeyCode <= 90) && !theShiftKey) || ((theKeyCode >= 97 && theKeyCode <= 122) && theShiftKey)) {
                        message.remove(fld);
                        if (flag.capsIsOn == null) {
                            $(fld).after("<span class=\"jsfield_error\" style=\"background:red;font-size:12px;font-weight:bold;color:#fff;padding:2px;\">Caps Lock Is On</span>");
                            $(fld).addClass(settings.className);
                            $(fld).attr("jsfield_isValid", false);
                        }
                        else {
                            flag.capsIsOn.call();
                        }
                    }
                    else {
                        if (flag.capsIsOff == null) {
                            message.remove(fld);
                        }
                        else {
                            flag.capsIsOff.call();
                        }
                    }
                }
            },
            onFieldClick: function (fld, settings) {
                $(fld).click(function (e) {
                    if (settings.mandatory) {
                        message.remove(fld);
                        if (settings.initMessage != "")
                            $(fld).after("<span class=\"jsfield_init\"> " + settings.initMessage + " </span>");
                    }
                });
            },
            onMinLength: function (fld, settings, e) {
                var fldValue = fld.value.toString();
                if (settings.minLength != null && !isNaN(parseInt(settings.minLength))) {
                    if (e != undefined && e.type == "blur" && fldValue.length < parseInt(settings.minLength)) {
                        e.preventDefault();
                        message.remove(fld);
                        if (settings.minLengthMessage != "")
                            $(fld).after("<span class=\"jsfield_min\"> " + settings.minLengthMessage + "</span>");
                        $(fld).addClass(settings.className);
                        $(fld).attr("jsfield_isValid", false);
                        if (settings.onMinLength != null)
                            settings.onMinLength.call(fld);
                    }
                }
            },
            onMaxLength: function (fld, settings, e) {
                var fldValue = fld.value.toString();
                var selectionText = methods.getSelection(fld);

                if (e != undefined && settings.maxLength != null && !isNaN(parseInt(settings.maxLength)) && e.which != 0) {
                    if (e.type == "keypress" && fldValue.length >= parseInt(settings.maxLength) && selectionText == "" && e.which != 0 && e.which != undefined) {
                        if (e.which == 8)
                            return false;
                        e.preventDefault();
                        message.remove(fld);
                        if (settings.maxLengthMessage != "")
                            $(fld).after("<span class=\"jsfield_max\"> " + settings.maxLengthMessage + "</span>");
                        $(fld).addClass(settings.className);
                        $(fld).attr("jsfield_isValid", false);
                        if (settings.onMaxLength != null)
                            settings.onMaxLength.call(fld);
                    }
                    else if (e.type == "blur" && fldValue.length > parseInt(settings.maxLength)) {
                        e.preventDefault();
                        message.remove(fld);
                        if (settings.maxLengthMessage != "")
                            $(fld).after("<span class=\"jsfield_max\"> " + settings.maxLengthMessage + "</span>");
                        $(fld).addClass(settings.className);
                        $(fld).attr("jsfield_isValid", false);
                        if (settings.onMaxLength != null)
                            settings.onMaxLength.call(fld);
                    }
                }
                else if (settings.maxLength != null && !isNaN(parseInt(settings.maxLength)) && e == undefined && fldValue.length > parseInt(settings.maxLength)) {
                    message.remove(fld);
                    if (settings.maxLengthMessage != "")
                        $(fld).after("<span class=\"jsfield_max\"> " + settings.maxLengthMessage + "</span>");
                    $(fld).addClass(settings.className);
                    $(fld).attr("jsfield_isValid", false);
                    if (settings.onMaxLength != null)
                        settings.onMaxLength.call(fld);
                }
            },
            validate: function (fld) {
                $(fld).focus();
                $(fld).blur();

            },
            reset: function (fld) {
                $(fld).val("");
                $(fld).removeClass(settings.className);
                $(fld).attr("jsfield_isValid", true);
            },
            clear: function (fld) {
                $(fld).val("");
            }
        };
        $(this.selector).keydown(function (e) { if (e.ctrlKey) { flag.ctrlKey = true; } });
        $(this.selector).keyup(function (e) { if (!e.ctrlKey) { flag.ctrlKey = false; } });
        if (options.type) {
            options.type = options.type.split(",");
            var selectors = this.selector.split(",")
            if (selectors.length != options.type.length) {
                alert("The number of selectors should be equivalent to the number of types.");
                return false;
            }
        }
        return this.each(function () {
            if (options && typeof options === 'object') {
                $.extend(settings, options);
                var fieldtype = (options.type ? settings.type[0] : settings.type);
                if (options.type && options.type.length > 1) {
                    var iselector = $.inArray("#" + this.id, selectors);
                    if (iselector == -1) {
                        var thisClass = this.className.split(" ");
                        if (thisClass.length > 0) {
                            $(thisClass).each(function (iClass) {
                                iselector = $.inArray("." + thisClass[iClass], selectors);
                                if (iselector > -1)
                                    return false;
                            });
                        }
                    }
                    fieldtype = options.type[iselector];
                }
                jsfield.className = settings.className;
                $(this).attr("jsfield", "jsfield," + fieldtype);
                $(this).attr("jsfield_isValid", true);
                switch (fieldtype) {
                    case "default":
                        init.field(this, settings);
                        break;
                    case "number":
                        init.numeric(this, settings);
                        break;
                    case "decimal":
                        init.decimal(this, settings);
                        break;
                    case "hour":
                        init.hour(this, settings);
                        break;
                    case "alpha":
                        init.alpha(this, settings);
                        break;
                    case "alphanumeric":
                        init.alphanumeric(this, settings);
                        break;
                    case "email":
                        init.email(this, settings);
                        break;
                    case "date":
                        init.date(this, settings);
                        break;
                    default:
                        alert('Field type "' + fieldtype + '" does not exist on jquery.jsfield');
                        break;
                }
            }
            else if (typeof options === 'string') {
                switch (options) {
                    case "validate":
                        methods.validate(this);
                        break;
                    case "reset":
                        methods.reset(this);
                        break;
                    case "clear":
                        methods.clear(this);
                        break;
                }
            }
        });

    };
})(jQuery);

var jsfield = {
    className: "",
    validateNoCallBack: function (customSelector) {
        var jsfieldSelector = "html";
        if (customSelector)
            jsfieldSelector = customSelector;
        var jsfields = $(jsfieldSelector + " [jsfield*='jsfield']");
        if (jsfields.length == 0)
            jsfields = $(jsfieldSelector + "[jsfield*='jsfield']");
        if (jsfields.length > 0) {
            $(jsfields).jsfield("validate");
        }
    },
    validate: function (customSelector, ifValid, ifInvalid) {
        if ((typeof customSelector == "string" || customSelector == undefined) && ifValid == undefined && ifInvalid == undefined) {
            jsfield.validateNoCallBack(customSelector);
            return;
        }
        if (typeof customSelector == "function") {
            ifInvalid = ifValid;
            ifValid = customSelector;
            customSelector = null;
        }
        var jsfieldSelector = "html";
        if (customSelector)
            jsfieldSelector = customSelector;
        var jsfields = $(jsfieldSelector + " [jsfield*='jsfield']");
        if (jsfields.length == 0)
            jsfields = $(jsfieldSelector + "[jsfield*='jsfield']");
        if (jsfields.length > 0) {
            jsfields.each(function (iField) {
                $(jsfields).jsfield("validate");
                if ((iField + 1) == jsfields.length) {
                    var jsfield_invalids = $(jsfieldSelector + "[jsfield_isValid=\"false\"]");
                    if (jsfield_invalids.length == 0)
                        jsfield_invalids = $(jsfieldSelector + " [jsfield_isValid=\"false\"]");
                    if (jsfield_invalids.length == 0) {
                        if (ifValid)
                            ifValid.call();
                    }
                    else {
                        if (ifInvalid)
                            ifInvalid.call();
                    }
                }
            });

        }
    },
    reset: function (customSelector) {
        var jsfieldSelector = "html";
        if (customSelector)
            jsfieldSelector = customSelector;
        var jsfields = $(jsfieldSelector + " [jsfield*='jsfield']");
        if (jsfields.length == 0)
            jsfields = $(jsfieldSelector + "[jsfield*='jsfield']");
        if (jsfields.length > 0) {
            $(jsfields).val("");
            $(jsfields).removeClass(jsfield.className);
            $(jsfields).attr("jsfield_isValid", true);
        }
    },
    clear: function (customSelector) {
        var jsfieldSelector = "html";
        if (customSelector)
            jsfieldSelector = customSelector;
        var jsfields = $(jsfieldSelector + " [jsfield*='jsfield']");
        if (jsfields.length == 0)
            jsfields = $(jsfieldSelector + "[jsfield*='jsfield']");
        if (jsfields.length > 0) {
            $(jsfields).val("");
        }
    },
    isValid: function (customSelector) {
        var jsfieldSelector = "html";
        if (customSelector)
            jsfieldSelector = customSelector;
        var jsfield_invalids = $(jsfieldSelector + "[jsfield_isValid=\"false\"]");
        if (jsfield_invalids.length == 0)
            jsfield_invalids = $(jsfieldSelector + " [jsfield_isValid=\"false\"]");
        if (jsfield_invalids.length == 0) {
            return true;
        }
        else {
            return false;
        }
    }
};