import time
from selenium import webdriver
from selenium.webdriver.common.by import By

# Initialize the WebDriver
driver = webdriver.Chrome()

# Open the settings page
driver.get("file:///PrimeDeviation__mentus/components/settings/settings.html")

# Wait for the page to load
time.sleep(2)

# Check the values in the spans
def check_span_value(element_id, expected_value):
    element = driver.find_element(By.ID, element_id)
    assert element.text == expected_value, f"Expected {expected_value} but got {element.text}"

# Load settings from local storage
driver.execute_script("""
localStorage.setItem('openaiApiKey', 'test_openai_key');
localStorage.setItem('anthropicApiKey', 'test_anthropic_key');
localStorage.setItem('graphdbEndpoint', 'test_graphdb_endpoint');
localStorage.setItem('graphdbCreds', 'test_graphdb_creds');
localStorage.setItem('localStorageLocation', 'test_local_storage_location');
localStorage.setItem('cloudStorageEndpoint', 'test_cloud_storage_endpoint');
localStorage.setItem('cloudStorageCreds', 'test_cloud_storage_creds');
localStorage.setItem('graphSource', 'test_graph_source');
localStorage.setItem('graphType', 'test_graph_type');
localStorage.setItem('editorSettings', 'test_editor_settings');
localStorage.setItem('codeRepoIntegration', 'test_code_repo_integration');
localStorage.setItem('obsidianVaultPath', 'test_obsidian_vault_path');
localStorage.setItem('logseqRepoPath', 'test_logseq_repo_path');
""")

# Refresh the page to load the settings
driver.refresh()

# Wait for the page to load
time.sleep(2)

# Check the values in the spans
check_span_value('current-openai-api-key', '****key')
check_span_value('current-anthropic-api-key', '****key')
check_span_value('current-graphdb-endpoint', 'test_graphdb_endpoint')
check_span_value('current-graphdb-creds', '****creds')
check_span_value('current-local-storage-location', 'test_local_storage_location')
check_span_value('current-cloud-storage-endpoint', 'test_cloud_storage_endpoint')
check_span_value('current-cloud-storage-creds', '****creds')
check_span_value('current-graph-source', 'test_graph_source')
check_span_value('current-graph-type', 'test_graph_type')
check_span_value('current-editor-settings', 'test_editor_settings')
check_span_value('current-code-repo-integration', 'test_code_repo_integration')
check_span_value('current-obsidian-vault-path', 'test_obsidian_vault_path')
check_span_value('current-logseq-repo-path', 'test_logseq_repo_path')

print("All tests passed!")

# Close the WebDriver
driver.quit()
