---
title: "Dateien lesen, bearbeiten, verschieben und löschen mit Java für Anfänger"
date: "2020-05-31"
categories: 
  - "Anleitungen"
coverImage: "/images/posts/icon-2488093_1280.png"
---

Als Java-Entwickler merkt man manchmal, dass das Java Ökosystem etwas verwirrend sein kann. So ist auch der Umgang mit Dateien nicht auf den ersten Blick ganz klar. Früher gab es in Java die File API, die aber mittlerweile veraltet ist. Ich war sie selbst noch gewohnt, weswegen ich mir vor kurzem selber gelernt habe und meine Erkenntnisse jetzt verschriftliche.

## Die neue API

Dateien/Files werden nun mit _java.nio.file.Path_ und _java.nio.file.Files_ bearbeitet.

## Wie Pfade funktionieren

Pfade können auf verschiedenste Arten referenziert werden, wobei die unteren drei alle das gleiche Resultat bewirken. Zu bemerken ist dabei, dass sämtliche Schreibweisen, also / oder \\\\ OS Independent sind. Paths können außerdem auf Files und auf Directories zeigen.

```
Path path= .........
Path.of("c:\\files\\pictures\\summer\\portrait.png");
Path.of("c:/files/pictures/summer/portrait.png");
Path.of("c:" , "files", "pictures", "summer", "portrait.png");
Path.of("c:" , "files", "pictures", "summer").resolve("portrait.png");
```

Dieser path ist nun eine Art Zeiger auf die Datei. Mit den Methoden von _Files_ kann ich nun mit dem Pfad auch tatsächlich etwas anfangen.

Folgend ein paar Dinge die Common Operations darstellen:

## Häufig benutzte Funktionen für den Umgang mit Dateien in Java

**Erstellen von Dateien**

```
Files.exists(path); 
//Existiert an dieser Stelle ein File oder Directory true/false
Files.createFile(directory.resolve("readme.txt"));
//Erstellt in dem Verzeichnis/Ordner auf den der Pfad verweist die Datei //readme.txt 
Files.createDirectories(path.getParent().resolve("some/new/dir"));
//Erstellt ein Verzeichnis im Verzeichnis 
```

**In Dateien schreiben**

```
Files.writeString(filePath, "Ein String"); 
//Möchte man Encoding angeben funktioniert das über die ENUM StandardCharsets als Parameter, das Überschreibungs/Erstellungsverhalten ist über StandardOpenOption einstellbar.
```

**Bytes schreiben**

```
Files.write(filePath, "Ein String".getBytes(StandardCharsets.ISO_8859_1));
```

**Files/Dateien lesen**

```
String s = Files.readString(filePath) //lest einen File als String ein
Stream<String> lines = Files.readAllLines(filePath) //Gibt mir einen Stream der einzelnen Zeilen des Files.
```

**Dateien verschieben**

Wichtig: Funktioniert im Sinne des ganzen Pfades inkl. Dateiname als Ziel

```
Files.move(filePath, Path.of("c:\\var").resolve(filePath.getFileName().toString())); //Auch hier ist StandardCopyOption benutzbar
```

**Eine Datei löschen**

```
try {
    Files.delete(filePath);
} catch (DirectoryNotEmptyException ex) {
    ex.printStackTrace();
}
```

**Ein nicht leeres Verzeichnis löschen - leere sind wie eine Datei löschbar**

```
try (Stream<Path> walk = Files.walk(tmpDir)) {
    walk.sorted(Comparator.reverseOrder()).forEach(path -> {
        try {
            Files.delete(path);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    });
}
```

**Alle Dateien eines Ordners ausgeben in Java**

```
try (var files = Files.list(tmpDirectory)) {
    files.forEach(System.out::println);
}
```

#### Java Dateibehandlung - Ein erweitertes Beispiel: HTTP FileUpload über SpringBoot

```
@Controller
public class FileUploadController {
//Das UserHomeVerzeichnis
  public static String uploadDirectory = System.getProperty("user.dir")+"/uploads";
//Der Pfad zum Aufruf der API
 @RequestMapping("/upload")
  public String upload(@RequestParam("files") MultipartFile[] files) {
	  StringBuilder fileNames = new StringBuilder();
	  for (MultipartFile file : files) {
		  Path fileNameAndPath = Paths.get(uploadDirectory, file.getOriginalFilename());
		  fileNames.append(file.getOriginalFilename()+" ");
		  try {
			Files.write(fileNameAndPath, file.getBytes());
		} catch (IOException e) {
			e.printStackTrace();
		}
	  }
	
  }
```
