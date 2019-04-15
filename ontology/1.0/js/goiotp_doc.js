/**
  * INTER-IoT. Interoperability of IoT Platforms.
  * INTER-IoT is a R&D project which has received funding from the European
  * Union<92>s Horizon 2020 research and innovation programme under grant
  * agreement No 687283.
  *
  * Copyright (C) 2016-2018, by (Author's company of this file):
  * - Systems Research Institute Polish Academy of Sciences
  *
  *
  * For more information, contact:
  * - @author <a href="mailto:pawel.szmeja@ibspan.waw.pl">Paweł Szmeja</a>
  * - Project coordinator:  <a href="mailto:coordinator@inter-iot.eu"></a>
  *
  *
  * This code is licensed under the EPL license, available at the root
  * application directory.
  */

  /**
  	Replaces any content with <div class="redacted">[redacted]</div>
  */
function redact(utils, content, url ){
  // Removes content
  // 🦄 🐴 🌈
  return '<div class="redacted">[redacted]</div>';
}

function extractOWLContentFromOntology(utils, content, url ){
  //Extract information about a single OWL definition from an ontology file
  
  /*
  console.log("Test log message");
  console.log(utils);
  console.log(content);
  console.log(url);
  */
  
  //RegExp to read prefixed entity URI
  /*var reTitle = new RegExp('<h2>.*</h2>');
  var title = reTitle.exec(content);
  console.log(titles);*/
  
  var prefURI = url.substring(url.indexOf("#") + 1);
  //console.log(prefURI);
  var fullURI = prefURI.replace(new RegExp('^iiotex:'), "http://inter-iot.eu/GOIoTPex#");
  fullURI = fullURI.replace(new RegExp('^iiot:'), "http://inter-iot.eu/GOIoTP#");
  
  if(prefURI == 'iiot:jsonTest'){
	  console.log(content);
	  var iotDevJSON = JSON.parse(content).iiot.IoTDevice;
	  return "name: " + iotDevJSON.name + "<br/>" + 
			 "type: " + iotDevJSON.type + "<br/>" + 
			 "subclasses: " + iotDevJSON.subclasses + "<br/>" + 
			 "turtle: " + iotDevJSON.ttl + "<br/>";
  }
  
  //console.log(fullURI);
  var reTurtle = new RegExp('###  ' + fullURI + '[\\s\\S]*?###');
  //console.log(reTurtle);
  var turtle = reTurtle.exec(content)[0];
  //console.log(turtle);
  
  var newContent = turtle.substring(0,turtle.length-3);
  //newcontent = newContent.replace(new RegExp("[\\n|\\r|\\n\\r|\\r\\n]", 'g'), '<br/>');
  //console.log(new RegExp("[\\n|\\r|\\n\\r|\\r\\n]", 'g'));
  
  return "<h2>" + prefURI + "</h2></br>" + '<pre>' + newContent + '<\pre>';
}

function extractOWLContentFromJSON(utils, content, url ){
  //Extract information about a single OWL definition from a JSON file
  
  var prefURI = url.substring(url.indexOf("#") + 1);
  //console.log(prefURI);
  var fullURI = prefURI.replace(new RegExp('^iiotex:'), "http://inter-iot.eu/GOIoTPex#");
  
  if(prefURI == 'iiot:jsonTest'){
	  console.log(content);
	  var iotDevJSON = JSON.parse(content).iiot.IoTDevice;
	  return "<h2>" + iotDevJSON.name + "</h2><br/>" + 
			 "name: " + iotDevJSON.name + "<br/>" + 
			 "type: " + iotDevJSON.type + "<br/>" + 
			 "subclasses: " + iotDevJSON.subclasses + "<br/>" + 
			 "turtle: " + iotDevJSON.ttl + "<br/>";
  }
  
  return '';
}

function generatePrefixTable(utils, content, url ){
  var prefixes = JSON.parse(content).prefixes;
  var table = "<tbody>\n<tr>\n<th> Name </th>\n<th> prefix </th>\n<th> URI </th>\n</tr>";

  for (var i = 0, len = prefixes.length; i < len; i++) {
    table += "<tr>\n";
    table += "<td>" + prefixes[i].name + "</td>\n";
    table += "<td>" + prefixes[i].prefix + "</td>\n";
    table += "<td>" + prefixes[i].uri + "</td>\n";
    table += "</tr>\n";
  }

  table += "</tbody>"
  return table;
}

/**
	Creates sections for ontological entities.
	"Strict" condition filters entities that are defined in an ontology file that contains ontology
	with the same URI, as the entity URI base.
	In other words entity and ontology URI need to match.
*/
function generateEntitiesSectionsFromJSONStrict(utils, content, url ){
	return generateEntitiesSectionsFromJSON(utils, content, url, true);
}

/**
	Creates sections for ontological entities.
	"Non Strict" condition filters entities that are defined in an ontology file that contains ontology
	with a given URI, that is different from the entity URI base.
	In other words entity and ontology URI must not match.
*/
function generateEntitiesSectionsFromJSONNonStrict(utils, content, url ){
	return generateEntitiesSectionsFromJSON(utils, content, url, false);
}

/**
@param {string} url The address of a JSON file with entities. Parameters should be placed in {url}, after a hash (#)
	e.g. files/entities.json#my_prefix:Class
	parameters after # are: [ontology prefix]:[entity type]
	prefix should be defined in the entities JSON file.
	predefined entity types are: Class, NamedIndividual, ObjectProperty, DataProperty, AnnotationProperty, Datatype
	other types are allowed, and will be used, if they are used in the JSON file.
@param {string}  content The content of a JSON file with entity descriptions.
*/
function generateEntitiesSectionsFromJSON(utils, content, url, strict ){
  var params = url.substring(url.indexOf("#") + 1).split(":");
  var prefixParam = params[0]
  var typeParam = params[1]
  
  var jsonData = JSON.parse(content);
  var entities = Array.from(new Set(jsonData.entities)).sort(function(x,y){return x.name.localeCompare(y.name)});
  var prefixes = jsonData.prefixes;

  var prefixExp = "";
  var prefix = null;
  for (var i = 0, len = prefixes.length; i < len; i++) {
    prefix = prefixes[i];
    if(prefix.prefix == prefixParam){
      prefixExp = prefix.uri;
      break;
    }
  }

  if(prefixExp == "")
    return "";

  var htmlContent = "";
  var typeOf = "";
  var OWLType = "";
  var OWLTypeSuperscript = "";
  switch(typeParam){
	case "Class":
		typeOf = "owl:Class rdfs:Class";
		OWLType = "OWL Class";
		OWLTypeSuperscript = '<span class="owl-type-symbol type-class">C</span>';
		break;
	case "ObjectProperty":
		typeOf = "owl:ObjectProperty rdf:Property";
		OWLType = "OWL Object Property";
		OWLTypeSuperscript = '<span class="owl-type-symbol type-object-property">OP</span>';
		break;
	case "DataProperty":
		typeOf = "owl:DatatypeProperty rdf:Property";
		OWLType = "OWL Data Property";
		OWLTypeSuperscript = '<span class="owl-type-symbol type-datatype-property">DP</span>';
		break;
	case "AnnotationProperty":
		typeOf = "owl:AnnotationProperty rdf:Property";
		OWLType = "OWL Annotation Property";
		OWLTypeSuperscript = '<span class="owl-type-symbol type-annotation-property">AP</span>';
		break;
	case "NamedIndividual":
		typeOf = "owl:NamedIndividual";
		OWLType = "OWL Named Individual";
		OWLTypeSuperscript = '<span class="owl-type-symbol type-indivivual">NI</span>';
		break;
	case "Datatype":
		typeOf = "rdfs:Datatype";
		OWLType = "OWL Datatype";
		OWLTypeSuperscript = '<span class="owl-type-symbol type-datatype">DT</span>';
		break;
    default: break;
  }

  if(OWLType != "") OWLType = `<p><strong>${OWLType}</strong></p>`;

  //TODO: rdfs:label, skos:definition, skos:example

  for (var i = 0, len = entities.length; i < len; i++) {
    var tit = entities[i];
    // if(tit.ontologyUri == prefixExp && tit.type == typeParam){

    var entityPrefix = prefixParam;
    var temp = "";
    for(let tempPrefix of prefixes){
    	if(tit.uri.startsWith(tempPrefix.uri)){
    		if(tempPrefix.uri.length > temp.length){
    			prefix = tempPrefix;
    			entityPrefix = prefix.prefix;
    			temp = tempPrefix.uri;
    		}
    	}
    }

    var condition = !tit.uri.startsWith(prefixExp) && tit.ontologyUri == prefixExp && tit.type == typeParam;
    if(strict) condition = tit.uri.startsWith(prefixExp) && tit.ontologyUri == prefixExp && tit.type == typeParam;

    if(condition){
		var label = extractLabel(tit);
		var comments = extractComments(tit);
		var examples = extractExamples(tit);

		var annotationsTable = extractAnnotationsTable(tit);

		var fullTable = "";

		if(tit.hasOwnProperty("skosExamples")){

		}

		var definedInText = "Defined in:";
		if(!strict) definedInText = "Used in:";

		fullTable += makeTableRow("Example", examples, "");

		switch(typeParam){
		    case "Class":
		    fullTable += makeTableRow("Sub class of", extractSuperclasses(tit), "entitydescription")
		    			+ makeTableRow("Restrictions", preprocessRestrictions(tit.Restrictions), "entitydescription");
		     break;
		case "ObjectProperty":
		case "DataProperty":
		case "AnnotationProperty":
			fullTable += makeTableRow("Inverse of", extractInverseOf(tit), "")
						+ makeTableRow("Subproperty of", extractSuperproperty(tit), "entitydescription")
					  	+ makeTableRow("Domain", extractDomain(tit), "entitydescription")
      				   	+ makeTableRow("Range", extractRange(tit), "entitydescription");
			break;
		case "NamedIndividual":
			fullTable += makeTableRow("Type", extractTypes(tit), "entitydescription")
						+ makeTableRow("Assertions", extractAssertions(tit), "entitydescription")
			break;
		case "Datatype":
			fullTable += makeTableRow("Definitions", extractDatatypeDefinitions(tit), "entitydescription");
			break;
		default: break;
		}

      if(fullTable.length > 1)
      	fullTable = `
      		<table>
                <tbody>
                    ${fullTable}
                </tbody>
            </table>`;

      var externalDoc ="";

      if(prefix.docUriExternal){
      	var docHyperlink = prepareDocumentationHyperlink(prefix.docUri, tit);
		externalDoc = `<p><a href="${docHyperlink}" target="_blank">Official ${prefix.name} documentation for ${entityPrefix}:${tit.name}</a></p>`;
      }

      var newSection = `
        <section class="specterm entitydef" id="${entityPrefix}-${tit.name}" about="${entityPrefix}:${tit.name}" typeof="${typeOf}">
        <h2>${entityPrefix}:${tit.name}</h2>${OWLTypeSuperscript}
          <p class="crossreference"><strong>IRI:</strong> ${tit.uri}</p>
          ${externalDoc}
          ${OWLType}
          <em property="rdfs:label">${label}</em> 
          <span property="rdfs:comment skos:definition">${comments}</span><br/>
          
          ${fullTable}
          ${annotationsTable}
          <div class="float-right"><strong>${definedInText}</strong> ${tit.ontologyUri}</div><br/>
        </section>`;

        htmlContent += newSection;
    }
  }

  function makeTableRow(head, data, cssClass){
  	if(data == null || data.length < 1)
  		return "";

  	var classAttribute = "";
  	if(cssClass != null && cssClass.length > 0)
  		classAttribute=` class="${cssClass}"`;
  	return `<tr${classAttribute}>
                <th>${head}</th>
                <td>${data}</td>
            </tr>`;
  }

  function preprocessRestrictions(txt){
    if(txt){
      var sub = txt;
      sub = sub.replace(new RegExp('\n', "g"), " <br/> ");
      sub = sub.replace(new RegExp(' some ', "g"), ' <span class="manColor">some</span> ');
      sub = sub.replace(new RegExp(' only ', "g"), ' <span class="manColor">only</span> ');
      sub = sub.replace(new RegExp(' min ', "g"), ' <span class="manColor">min</span> ');
      sub = sub.replace(new RegExp(' max ', "g"), ' <span class="manColor">max</span> ');

      return addDocumentationHyperlinks(sub);
    } else {
      return "";
    }
  }

  function extractLabel(entity){
    var label = entity.name;
    if(entity.hasOwnProperty("labels")){
      for(var i = 0, len = entity.labels.length; i < len; i++){
        var lab = entity.labels[i];
        if(lab.hasOwnProperty("annotation")){
          if(i == 0){
            label = lab.annotation;
          } else if(lab.lang == "en"){
            label = lab.annotation;
          }
        }
      }
    }
    return label;
  }

  function extractComments(entity){
    var comments = "";

    if(entity.hasOwnProperty("comments")){
      for(var i = 0, len = entity.comments.length; i < len; i++){
        var comment = entity.comments[i];
        if(comment.hasOwnProperty("annotation")){
          comments += comment.annotation;
          if(i > 0){
            comments += "\n\n";
          }
        }
      }
    }

    if(comments != "") comments = " - " + comments;

    return comments.replace(new RegExp('\n'), "<br/>");
  }

  function extractExamples(entity){
    var examples = "";

    if(entity.hasOwnProperty("skosExamples")){
    	for(var i = 0, len = entity.skosExamples.length; i < len; i++){
    		var example = entity.skosExamples[i];
    		if(example.hasOwnProperty("annotation")){
    			examples += '<span property="skos:example">' + example.annotation + '</span>';
    			if(i > 0){
           			examples += "\n\n";
          		}
    		}
    	}
    }

    return examples.replace(new RegExp('\n'), "<br/>");
  }

  function extractSuperclasses(entity){
  	var superclasses = ""
  	if(entity.hasOwnProperty("SubclassOf")){
  		var arr = entity.SubclassOf.split("\n");
  		for(var i = 0, len = arr.length; i < len; i++){
  			var superclass = addDocumentationHyperlinks(arr[i]);
  			superclasses += `<span rel="rdfs:subClassOf" resource="${arr[i]}">${superclass}</span>`;
  			if(i > 0) superclasses += "<br/>";
  		}
  	}
  	
	if(superclasses == ""){
		superclasses = `<span rel="rdfs:subClassOf" resource="owl:Thing">owl:Thing</span><br/>`;
	}

  	return superclasses;
  }

  function extractInverseOf(entity){
  	var inverseOf = "";
  	if(entity.hasOwnProperty("inverseOf")){
		var arr = entity.inverseOf.split("\n");
		for(var i = 0, len = arr.length; i < len; i++){
			var temp = arr[i].trim();
			inverseOf += `<span rel="owl:inverseOf" resource="${temp}">` + addDocumentationHyperlinks(temp) + '</span>';
			if(i > 0) inverseOf += "<br/>";
		}
  	}

  	return inverseOf;
  }

  function extractSuperproperty(entity){
  	var superproperties = "";

	if(entity.hasOwnProperty("SubpropertyOf")){
		var arr = entity.SubpropertyOf.split("\n");
		for(var i = 0, len = arr.length; i < len; i++){
			var temp = arr[i].trim();
			superproperties += `<span rel="owl:inverseOf" resource="${temp}">` + addDocumentationHyperlinks(temp) + '</span>';
			if(i > 0) superproperties += "<br/>";
		}
  	}
  	return superproperties;
  }

  function extractDomain(entity){
  	var domain = "";

	if(entity.hasOwnProperty("domain")){
		var arr = entity.domain.split("\n");
		for(var i = 0, len = arr.length; i < len; i++){
			var temp = arr[i].trim();
			domain += `<span rel="rdfs:domain">` + preprocessRestrictions(temp) + '</span>';
			if(i > 0) domain += "<br/>";
		}
  	}

  	return domain;
  }

  function extractRange(entity){
  	var range = "";

	if(entity.hasOwnProperty("range")){
		var arr = entity.range.split("\n");
		for(var i = 0, len = arr.length; i < len; i++){
			var temp = arr[i].trim();
			range += `<span rel="rdfs:range">` + preprocessRestrictions(temp) + '</span>';
			if(i > 0) range += "<br/>";
		}
  	}

  	return range;
  }

  function extractTypes(entity){
  	var types = "";

	if(entity.hasOwnProperty("types")){
		var arr = entity.types.split("\n");
		for(var i = 0, len = arr.length; i < len; i++){
			var temp = arr[i].trim();
			types += `<span rel="rdf:type">` + addDocumentationHyperlinks(temp) + '</span>';
			if(i > 0) types += "<br/>";
		}
  	}

  	return types;
  }

  function extractAssertions(entity){
  	var assertions = "";

	if(entity.hasOwnProperty("assertions")){
		var arr = entity.assertions.split("\n");
		for(var i = 0, len = arr.length; i < len; i++){
			var temp = arr[i].trim();
			assertions += preprocessRestrictions(temp);
			if(i > 0) assertions += "<br/>";
		}
  	}

  	return assertions;
  }

  function extractDatatypeDefinitions(entity){
  	var definitions = "";

	if(entity.hasOwnProperty("definitions")){
		var arr = entity.definitions.split("\n");
		for(var i = 0, len = arr.length; i < len; i++){
			var temp = arr[i].trim();
			definitions += preprocessRestrictions(temp);
			if(i > 0) definitions += "<br/>";
		}
  	}

  	return definitions;
  }

  function extractAnnotationsTable(entity){
  	var annotations = "";
	if(entity.hasOwnProperty("annotations")){
		for(let annotation of entity.annotations){
			annotations += makeTableRow(annotation.property, annotation.annotation, "");
		}
	}

	if(annotations != ""){
		annotations = `
		<br/>Other annotations:
  		<table>
            <tbody>
                ${annotations}
            </tbody>
        </table>`;
	}

	return annotations;
  }

  function addDocumentationHyperlinks(nonHtmlContent){

  	//replaces all occurences of xxx:YYY with <a href="docUri">xxx:YYY</a>,
  	//where docUri is a URL defined in "docUri" attribute of a prefix xxx
  	//NOTE: This method is not safe for html code, where xxx:YYY occurs inside a html attribute

  	//Iterate through all prefixes
  	for (var i = 0, len = prefixes.length; i < len; i++) {
    	var prefix = prefixes[i];

    	//Find prefixes that have a docUri
    	if(prefix.hasOwnProperty("docUri")){
    		var docUri = prefix.docUri;

    		//Find all occurences of prefixed entities mathing found prefix
    		var matches = nonHtmlContent.match(new RegExp(prefix.prefix + ':(\\S*)\\s*','g'));
    		if(matches != null){
    			//Trim matches and make a set to remove duplicates
				var trimmedMatches = new Array();
				for (var j = 0, len2 = matches.length; j < len2; j++) {
					trimmedMatches.push(matches[j].trim());
				}
    			var matchesSet = new Set(trimmedMatches);

				for (let x of matchesSet) {
					//For each found prefixed entity, find its data in entities JSON
				    var name = x.split(":")[1];
				    var fullUri = prefix.uri + name;
				    var entity = null;
				    for(let y of entities){
				    	if(y.uri == fullUri){
				    		entity = y;
				    		break;
				    	}
				    }

				    if(entity != null){
				    	//Prepare final docUri by substituting placeholders for actual values
				    	docUri = prepareDocumentationHyperlink(docUri, entity);
				 	   //Write new content with html <a>
				 	   nonHtmlContent = nonHtmlContent.replace(new RegExp(x,"g"), `<a href="${docUri}">${x}<\a>`);
					}
				}
    		}
    	}
  	}

  	return nonHtmlContent;
  }

  function prepareDocumentationHyperlink(documentationUri, entity){
  	var docUri = documentationUri;
  	docUri = docUri.replace(new RegExp("{name}", "g"), entity.name);
   	docUri = docUri.replace(new RegExp("{type}", "g"), entity.type);
   	docUri = docUri.replace(new RegExp("{uri}", "g"), entity.uri);
   	docUri = docUri.replace(new RegExp("{ontologyUri}", "g"), entity.ontologyUri);
   	return docUri;
  }

  return htmlContent;
}
