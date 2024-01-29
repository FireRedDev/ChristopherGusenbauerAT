---
title: "Angular - 5 nützliche Code-Snippets"
date: "2019-05-12"
categories: 
  - "tech"
tags: 
  - "angular"
  - "angular-code-snippet"
  - "angular-datum"
  - "angular-rest"
  - "angular-sortieren"
  - "angular-suchen"
coverImage: "sdf-1540x800.png"
---

Viele Anwendungsfälle im Webdevelopement wiederholen sich in beinahe jedem neuen Projekt. Deswegen ist es wichtig, häufig benutzten Code nicht jedesmal neu zu schreiben, sondern ihn als Codesnippet zu speichern. Hier sind 5 praktische, kurze Codesnippets vorgestellt.

## Sortieren in Angular

Listen, wie beispielsweise Personen sollten oft sortierbar nach z.B. dem Alphabet sein, mit folgenden Snippets lässt sich das bewerkstelligen:

**Sortieren nach Zahlen**

<table><tbody><tr><td>return this.persons.sort((n1,n2) =&gt; n1.id - n2.id);</td></tr></tbody></table>

**Sortieren nach String**

<table><tbody><tr><td>return this.persons.sort((a,b) =&gt; a.firstname.localeCompare(b.firstname));</td></tr></tbody></table>

## Suchfunktion für die Angular Web-App einbauen

In diesem Beispiel wird eine Liste von Personen ausgegeben, eine Person aber nur angezeigt, wenn sie mit den Kriterien der Suche übereinstimmt (also dem Nachnamen)

<table><tbody><tr><td>&lt;<strong>div</strong> *ngIf="matches(person)" &gt;<br>&nbsp;&nbsp;&nbsp;&nbsp;&lt;<strong>app-person-detail</strong> [person]="person" (deleted)="deletePerson(i)"&gt;&lt;/<strong>app-person-detail</strong>&gt;<br>&nbsp;&nbsp;&lt;/<strong>div</strong>&gt;</td></tr></tbody></table>

<table><tbody><tr><td>matches(person){<br>&nbsp;&nbsp;return (person.lastname.toUpperCase()).indexOf(this.searchstring.toUpperCase())==0||(person.firstname.toUpperCase()).indexOf(this.searchstring.toUpperCase())==0;<br>}</td></tr></tbody></table>

## Uhrzeit

Auch die grundsätzlichen Funktionen der Date Klasse sollte man kennen und ein mögliches Datumsformat.

<table><tbody><tr><td>var today = new Date();<br>var d = today.getDate();<br>var m = today.getMonth() + 1;<br>var y = today.getFullYear();<br>var h = today.getHours();<br>var m = today.getMinutes();<br>var s = today.getSeconds();<br>new Date('Jul 15 01:30:00 2001');</td></tr></tbody></table>

## Tabellen in Angular mit Objekten befüllen

Oft müssen wir Werte in Tabellen angeben und diese dynamisch verändern können. Dabei sind derartige Tabellen immer recht ähnlich aufgebaut.

Da das Dropdown bidirektional ist wird das aktuell selektierte Element auf die Variable actSchoolclass gespeichert. Wenn sich am Dropdown etwas verändert, so wird die Funktion getClass aufgerufen. Die leere Option wird benötigt, damit das erste Element im Dropdown leer ist, um zu verhindern, dass eine Klasse ausgewählt ist, ohne das es vom Benutzer so gewollt wurde.

Danach geht man die Liste an Classes in einem ngFor durch und erstellt für jede Klasse eine eigene Option.

Die Funktion ChangeTeacher wird aufgerufen, wenn sich im Dropdown etwas ändert. Als Parameter wird die Value des gerade ausgewählten Elements zurückgegeben. Zusätzlich muss man noch i und j übergeben, um die aktuelle Unit herausfinden zu können, um den neuen Teacher zu speichern.  

<select name="teacher" (change)="changeTeacher($event.target.value,i,j)">  
          <option></option>  
          <option \*ngFor="let t of teachers" \[value\]="t.id" \[selected\]="getUnit(i,j).teacher.id==t.id">  
            {{t.lastname}}  
          </option>  
        </select>

## **Erstellen eines RestServices**

Um am Client Daten vom Server abfragen oder an den Server senden zu können wird mit REST kommuniziert.  

<table><tbody><tr><td>import { Injectable } from '@angular/core';<br>import { HttpClient } from '@angular/common/http';<br><br>@Injectable({<br>providedIn: 'root'<br>})<br>export class RestService {<br>private http;<br>constructor(http: HttpClient) {<br>&nbsp;&nbsp;this.http = http;<br>}</td></tr></tbody></table>

**Abfragen aller Daten einer Entity-Klasse**

Durch Anlegen einer Methode im RestService und Verwendung der jeweiligen http-Methode können bestimmte Aufrufe an den Server gesendet werden. Dazu muss lediglich der Serverlink bzw. benötigte Daten in der Methode mitgegeben werden.

<table><tbody><tr><td>getAllTeacher() {<br>&nbsp;&nbsp;return this.http.get('http://localhost:8080/server/api/rest/teacher/findall');<br>}<br>getAllClasses() {<br>&nbsp;&nbsp;return this.http.get('http://localhost:8080/server/api/rest/class/findall');<br>}</td></tr></tbody></table>

Beispiel: **Abfragen bestimmter Daten nach einer anderen Klasse**

Um Daten abzufragen, die zu einem anderen Objekt zugehörig sind wird der Pfad der zugehörigen Serverfunktion als Parameter der http-Funktion mitgegeben. Zusätzlich wird die Id des jeweiligen Filter-Objekts mitgegeben.

<table><tbody><tr><td>findByClass(id) {<br>&nbsp;&nbsp;return this.http.get('http://localhost:8080/server/api/rest/unit/findbyclass/' + id);<br>}</td></tr></tbody></table>

Beispiel: **Abfrage zur Speicherung eines Objekts**

Um Daten speicher zu können, müssen diese an den Server gesendet werden. Das zu speichernde Objekt wird dabei einfach als zweiter Parameter der put, oder post-Funktion im Request-Body mitgegeben. Der erste Parameter ist wieder die jeweilige URL.

<table><tbody><tr><td>save(unit) {<br>&nbsp;&nbsp;return this.http.put('http://localhost:8080/server/api/rest/unit/save', unit);<br>}<br>}</td></tr></tbody></table>
