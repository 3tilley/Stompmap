using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using Stompmap.Models;
using Stompmap.Filters;
using System;
using System.Collections.Generic;

namespace Stompmap.Controllers
{
    [AppendUseMapIdActionFilter(true)]
    public class MarkersOnMapController : Controller
    {
        private ApplicationDbContext _context;

        private System.Collections.Concurrent.ConcurrentDictionary<int, int> _markerCountPerMap = new System.Collections.Concurrent.ConcurrentDictionary<int, int>();

        private async Task<int> GetMarkerCountForMap(int mapId)
        {
            // A value of -1 indicates that the data is being populated
            var keyDoesntExist = _markerCountPerMap.TryAdd(mapId, -1);
            if (keyDoesntExist)
            {
                // Get the count of the markers from the map
                var map = await _context.Map
                    .Include(m => m.Markers)
                    .SingleAsync(m => m.Id == mapId);

                var mc = map.Markers.Count();

                _markerCountPerMap.TryAdd(mapId, mc);

                return mc;
            } else
            {
                // Get the value of the key and knock it up one if it wasn't a zero
                var keyValue = _markerCountPerMap.AddOrUpdate(mapId, -1, (key, oldValue) =>
                    oldValue == -1 ? -1 : oldValue + 1);

                if (keyValue != -1)
                {
                    // Just return the count in the dictionary
                    return keyValue;
                } else
                {
                    await Task.Delay(100);

                    return await GetMarkerCountForMap(mapId);
                }
            }
        }

        private bool IsRequestJson()
        {
            var accHeader = Request.Headers["Accept"];
            var concatString = String.Concat(accHeader);
            return concatString.Contains("application/json");
        }

        public MarkersOnMapController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Map/5/Stomps/
        public async Task<IActionResult> Index(int mapId)
        {
            var applicationDbContext = _context.Marker.Include(m => m.Map);
            var ms = applicationDbContext.Where(m => m.MapId == mapId);

            var fullList = await ms.ToListAsync();

            if (IsRequestJson()) {
                var jsonReturn = new ObjectResult( fullList );
                return jsonReturn;
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

            if (IsRequestJson())
            {
                return new ObjectResult(marker);
            } else
            {
                return View("../" + nameof(Marker) + "/" + nameof(Details), marker);
            }
        }

        // GET: Map/5/Stomps/Create
        public IActionResult Create(int mapId)
        {
            ViewData["MapId"] = new SelectList(_context.Map, "Id", "Name");
            return View("../" + nameof(Marker) + "/" + nameof(Create));
        }

        // POST: Map/5/Stomps/Create
        [HttpPost]
        //[ValidateAntiForgeryToken]
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
                marker.IdOnMap = await GetMarkerCountForMap(mapId);
                
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
