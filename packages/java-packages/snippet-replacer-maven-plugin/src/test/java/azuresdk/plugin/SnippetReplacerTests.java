package azuresdk.plugin;

import static org.junit.Assert.*;
import org.junit.Test;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;

public class SnippetReplacerTests {

    private Path _getPathToResource(String relativeLocation){
        String pathToTestFile = SnippetReplacerTests.class.getResource(relativeLocation).getPath();

        if(pathToTestFile.startsWith("/")){
            pathToTestFile = pathToTestFile.substring(1);
        }

        return Path.of(pathToTestFile);
    }

    /**
     * @throws Exception if any
     */
    @Test
    public void testBasicSrcParse()
            throws Exception
    {
        Path testFile = _getPathToResource("../../project-to-test/basic_src_snippet_parse.txt");

        List<String> lines = Files.readAllLines(testFile, StandardCharsets.UTF_8);

        SnippetReplacer replacer = new SnippetReplacer();

        HashMap<String, List<String>> foundSnippets = replacer.GrepSnippets(lines);

        assertTrue(foundSnippets.size() == 2);
        assertTrue(foundSnippets.get("com.azure.data.applicationconfig.configurationclient.pipeline.instantiation").size() == 9);
        assertTrue(foundSnippets.get("com.azure.data.appconfiguration.ConfigurationClient.addConfigurationSetting#String-String-String").size() == 3);
    }
}
