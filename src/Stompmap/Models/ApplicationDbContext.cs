using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Data.Entity;
using Stompmap.Models;
using Newtonsoft.Json.Linq;

namespace Stompmap.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder
                .Entity<RawJson>()
                .Property(e => e.Serialised)
                .HasColumnName("GeocoderResult");

            builder.Entity<RawJson>().
                Ignore(e => e.jRaw);


            base.OnModelCreating(builder);
            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);
        }
        public DbSet<Map> Map { get; set; }
        public DbSet<Marker> Marker { get; set; }
    }
}
