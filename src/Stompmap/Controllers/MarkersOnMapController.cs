using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using Stompmap.Models;
using Stompmap.Filters;

namespace Stompmap.Controllers
{
    [AppendUseMapIdActionFilter(true)]
    public class MarkersOnMapController : Controller
    {
        private ApplicationDbContext _context;
        
        public MarkersOnMapController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Map/5/Stomps/
        public async Task<IActionResult> Index(int mapId)
        {
            var applicationDbContext = _context.Marker.Include(m => m.Map);
            var ms = applicationDbContext.Where(m => m.MapId == mapId);
            var isJson = Request.Headers["Accept"].Contains("application/json");

            var fullList = await ms.ToListAsync();

            if (isJson) {
                return Json(new { data = fullList });
                //return Ok(fullList);
            } else {
                return View("../" + nameof(Marker) + "/Index", fullList);
            }
        }

        // GET: Map/5/Stomps/Details/2
        public async Task<IActionResult> Details(int mapId, int? idOnMap)
        {
            if (idOnMap == null)
            {
                return HttpNotFound();
            }

            Marker marker = await _context.Marker.SingleAsync(m => m.MapId == mapId && m.IdOnMap == idOnMap);
            if (marker == null)
            {
                return HttpNotFound();
            }

            return View("../" + nameof(Marker) + "/" + nameof(Details), marker);
        }

        // GET: Map/5/Stomps/Create
        public IActionResult Create(int mapId)
        {
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name");
            return View("../" + nameof(Marker) + "/" + nameof(Create));
        }

        // POST: Map/5/Stomps/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(int mapId, Marker marker)
        {
            if (ModelState.IsValid)
            {
                marker.MapId = mapId;
                
                var map = await _context
                    .Map
                    .Include(m => m.Markers)
                    .SingleAsync(m => m.Id == mapId);

                marker.Map = map;
                marker.AddIdOnMap();
                
                _context.Marker.Add(marker);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name", marker.MapId);
            return View("../" + nameof(Marker) + "/" + nameof(Create), marker);
        }

        // GET: Map/5/Stomps/Edit/2
        public async Task<IActionResult> Edit(int mapId, int? idOnMap)
        {
            if (idOnMap == null)
            {
                return HttpNotFound();
            }

            Marker marker = await _context.Marker.SingleAsync(m => m.MapId == mapId && m.IdOnMap == idOnMap);
            if (marker == null)
            {
                return HttpNotFound();
            }

            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name", marker.MapId);
            return View("../" + nameof(Marker) + "/" + nameof(Edit), marker);
        }

        // POST: Map/5/Stomps/Edit/2
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Marker marker)
        {
            if (ModelState.IsValid)
            {
                _context.Update(marker);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name", marker.MapId);
            return View("../" + nameof(Marker) + "/" + nameof(Edit), marker);
        }

        // GET: Map/5/Stomps/Delete/2
        [ActionName("Delete")]
        public async Task<IActionResult> Delete(int mapId, int? idOnMap)
        {
            if (idOnMap == null)
            {
                return HttpNotFound();
            }

            Marker marker = await _context.Marker.SingleAsync(m => m.MapId == mapId && m.IdOnMap == idOnMap);
            if (marker == null)
            {
                return HttpNotFound();
            }

            return View("../" + nameof(Marker) + "/" + nameof(Delete), marker);
        }

        // POST: Map/5/Stomps/Delete/2
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int mapId, int idOnMap)
        {
            Marker marker = await _context.Marker.SingleAsync(m => m.MapId == mapId && m.IdOnMap == idOnMap);
            _context.Marker.Remove(marker);
            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }
    }
}
