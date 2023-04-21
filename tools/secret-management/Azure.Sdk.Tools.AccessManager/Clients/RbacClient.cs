using Azure;
using Azure.Core;
using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.Authorization;
using Azure.ResourceManager.Authorization.Models;
using Microsoft.Graph.Models;

namespace Azure.Sdk.Tools.AccessManagement;

/*
 * Wrapper for Azure.ResourceManager ArmClient
 */
public class RbacClient : IRbacClient
{
    public ArmClient ArmClient { get; set; }

    public RbacClient(DefaultAzureCredential credential)
    {
        ArmClient = new ArmClient(credential);
    }

    public async Task CreateRoleAssignment(ServicePrincipal servicePrincipal, RoleBasedAccessControlsConfig rbac)
    {
        var resource = ArmClient.GetGenericResource(new ResourceIdentifier(rbac.Scope!));
        var role = await resource.GetAuthorizationRoleDefinitions().GetAllAsync($"roleName eq '{rbac.Role}'").FirstAsync();
        Console.WriteLine($"Found role '{role.Data.RoleName}' with id '{role.Data.Name}'");

        var principalId = Guid.Parse(servicePrincipal?.Id ?? string.Empty);
        var content = new RoleAssignmentCreateOrUpdateContent(role.Data.Id, principalId)
        {
            PrincipalType = RoleManagementPrincipalType.ServicePrincipal
        };
        var roleName = Guid.NewGuid().ToString();

        try
        {
            Console.WriteLine($"Creating role assignment '{roleName}' for principal '{principalId}' with role '{role.Data.RoleName}' in scope '{rbac.Scope}'...");
            await resource.GetRoleAssignments().CreateOrUpdateAsync(WaitUntil.Completed, roleName, content);
        }
        catch (RequestFailedException ex)
        {
            if (ex.Status == 409)
            {
                Console.WriteLine($"The role assignment was already created by a different source. Skipping.");
                return;
            }
            throw ex;
        }
        Console.WriteLine($"Created role assignment '{roleName}' for principal '{principalId}' with role '{role.Data.RoleName}' in scope '{rbac.Scope}'");
    }
}

public interface IRbacClient
{
    public Task CreateRoleAssignment(ServicePrincipal app, RoleBasedAccessControlsConfig rbac);
}