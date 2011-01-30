(** Trist'
    Put a twist in Tetris
    Tetris, version verlan *)

(*
   Copyright Samuel Hym (2011)
   Samuel.Hym@gmail.com

   This software is governed by the CeCILL  license under French law and
   abiding by the rules of distribution of free software.  You can  use,
   modify and/ or redistribute the software under the terms of the CeCILL
   license as circulated by CEA, CNRS and INRIA at the following URL
   "http://www.cecill.info".

   As a counterpart to the access to the source code and  rights to copy,
   modify and redistribute granted by the license, users are provided only
   with a limited warranty  and the software's author,  the holder of the
   economic rights,  and the successive licensors  have only  limited
   liability.

   In this respect, the user's attention is drawn to the risks associated
   with loading,  using,  modifying and/or developing or reproducing the
   software by the user in light of its specific status of free software,
   that may mean  that it is complicated to manipulate,  and  that  also
   therefore means  that it is reserved for developers  and  experienced
   professionals having in-depth computer knowledge. Users are therefore
   encouraged to load and test the software's suitability as regards their
   requirements in conditions enabling the security of their systems and/or
   data to be ensured and,  more generally, to use and operate it in the
   same conditions as regards security.

   The fact that you are presently reading this means that you have had
   knowledge of the CeCILL license and that you accept its terms.
*)

(** The pieces, drawn *)
let drawn_pieces = "
  ....
  ###.
  ..#.
  ....

  .#..
  .#..
  ##..
  ....

  #...
  ###.
  ....
  ....

  .##.
  .#..
  .#..
  ....


  ....
  .###
  .#..
  ....

  .##.
  ..#.
  ..#.
  ....

  ...#
  .###
  ....
  ....

  ..#.
  ..#.
  ..##
  ....


  .#..
  .#..
  .#..
  .#..

  ....
  ####
  ....
  ....

  .#..
  .#..
  .#..
  .#..

  ....
  ####
  ....
  ....


  ....
  .##.
  .##.
  ....

  ....
  .##.
  .##.
  ....

  ....
  .##.
  .##.
  ....

  ....
  .##.
  .##.
  ....


  .#..
  .##.
  ..#.
  ....

  ..##
  .##.
  ....
  ....

  .#..
  .##.
  ..#.
  ....

  ..##
  .##.
  ....
  ....


  ..#.
  .##.
  .#..
  ....

  ##..
  .##.
  ....
  ....

  ..#.
  .##.
  .#..
  ....

  ##..
  .##.
  ....
  ....


  ....
  .#..
  ###.
  ....

  ....
  .#..
  .##.
  .#..

  ....
  ....
  ###.
  .#..

  ....
  .#..
  ##..
  .#.. "


let piece_size_x = 4
let piece_size_y = 4

let nb_pieces =
  let non_whites = ref 0 in
    String.iter (fun c -> if c = '.' || c = '#' then incr non_whites) drawn_pieces ;
    !non_whites / (piece_size_x*piece_size_y*4)

(** extracts the information from the "drawn" version of the pieces;
    the returned function [next] will returns [true] if the next square is
    filled, [false] otherwise *)
let drawing_parser str =
  let pos = ref 0 in
  let rec next () =
    match str.[!pos] with
      | '.' -> incr pos ; false
      | '#' -> incr pos ; true
      |  c  -> assert (c = ' ' || c = '\n') ; incr pos ; next ()
  in
    next

(** Array containing all the pieces.
    Each piece is 2D array of booleans ([true] for a filled cell);
    the full array is a matrix of pieces (all the rotations for all the pieces) *)
let pieces =
  let make_piece () = Array.make_matrix piece_size_y piece_size_x false in
  let arry = Array.make_matrix nb_pieces 4 (make_piece ()) in
  let next = drawing_parser drawn_pieces in
    for i = 0 to nb_pieces - 1 do
      for j = 0 to 3 do
        arry.(i).(j) <- make_piece () ;
        for k = 0 to piece_size_y - 1 do
          for l = 0 to piece_size_x -1 do
            arry.(i).(j).(k).(l) <- next ()
          done
        done
      done
    done ;
    arry

(** [make_board (x, y)] generates a new board of the given size *)
let make_board (x, y) = Array.make_matrix y x false

(** [test_fitting board piece position] returns whether the given [piece] will
    fit in the [board] at the given position. *)
let test_fitting board piece (x, y) =
  let i = ref 0 and j = ref 0
  and fitting = ref true in
    while !fitting && !j < Array.length piece do
      fitting :=
        (  not piece.(!j).(!i)
        || (  y + !j >= 0
           && y + !j < Array.length board
           && x + !i >= 0
           && x + !i < Array.length board.(y + !j)
           && not board.(y + !j).(x + !i) ) ) ;
      incr i ;
      if !i >= Array.length piece.(!j)
      then ( i := 0 ; incr j )
    done ;
    !fitting

(** [first_fitting board piece (x, y)] returns the greatest [y'] between [y] and
    [y]-[piece_size_y] such that the piece fits the board *)
let first_fitting board piece (x, y) =
  let y' = ref y in
    while not (test_fitting board piece (x, !y')) && !y' > y - piece_size_y do
      decr y'
    done ;
    if test_fitting board piece (x, !y')
    then Some !y'
    else None

(** [last_fitting board piece (x, y)] returns the smallest non-negative [y']
  such that the [piece] fits at every position [y']..[y].
  Assumes that the piece first fits at position [y] *)
let last_fitting board piece (x, y) =
  let y' = ref (y-1) in
  while test_fitting board piece (x, !y') && !y' >= -3 do
    decr y'
  done ;
  !y' + 1

(** [rotate_piece board piece position] tries to turn the [piece] if it fits;
  returns the piece, turned or not *)
let rotate_piece board ((pid, rot) as piece) position =
  let rotated = (rot+1) mod (Array.length pieces.(pid)) in
    if test_fitting board pieces.(pid).(rotated) position
    then (pid, rotated)
    else piece

(** [insert_piece board piece position]
    inserts the [piece] at its position in the [board] *)
let insert_piece board piece (x, y) =
  for j = 0 to piece_size_y-1 do
    for i = 0 to piece_size_x-1 do
      if piece.(j).(i)
      then board.(y+j).(x+i) <- true
    done
  done

(** [full_lines board] returns the list of the indices of full lines, in
    increasing order *)
let full_lines board =
  let lines = ref [] in
    Array.iteri
      (fun i l ->
         if Array.fold_left (&&) true l
         then lines := i :: !lines)
      board ;
    List.rev !lines

(** [gobble_full_lines board] gobbles all the full lines in the [board], moving
    left lines up and filling the board with empty lines; returns the number of
    lines gobbled *)
let gobble_full_lines board =
  let lines = ref (full_lines board) in
  let nb_lines = List.length !lines in
  let tgt = ref 0 and src = ref 0 in
    while !tgt < Array.length board do
      if !src < Array.length board
      then (* is the line !src to be copied or shipped? *)
        ( match !lines with
            | x :: ls when x = !src ->
                lines := ls
            | _ ->
                board.(!tgt) <- board.(!src) ;
                incr tgt )
      else (* the line !tgt must be fresh *)
        ( board.(!tgt) <- Array.make (Array.length board.(!tgt)) false ;
          incr tgt ) ;
      incr src
    done ;
    nb_lines

(** returns a random piece *)
let random_piece () =
  (Random.int nb_pieces, 0)

(** {2 Interface code} *)

open Js
module Html = Dom_html

(** {3 Extensions to O'Closure} *)

(** [repeat_until_false f t] calls [f] every [t] milliseconds until it returns
    [false]. *)
let repeat_until_false f t =
  let timer = jsnew Goog.Timer.timer (some t) in
  let tick = string "tick" in
  let rec func _ =
    if not (f ())
    then timer##removeEventListener(tick, wrap_callback func, null) ;
    _true
  in
    timer##addEventListener(tick, wrap_callback func, null) ;
    timer##start()

let events = Goog.Tools.variable "[oclosure]goog.events[/oclosure]"

(** [listen src type listener capt] ensures the callback gets the event target
    as parameter; otherwise as O'Closure event listen *)
let listen (src : (#Goog.Events.eventTarget t, #Html.eventTarget t) Goog.Tools.Union.t)
          (typ : js_string t)
          (listener : ('a -> unit) callback)
          (capt : bool t opt) : int =
    events##listen (src, typ, listener, capt)

(** {3 Machinery} *)

let require_content x = Opt.get x (fun () -> failwith "Missing content")
let require_element x = require_content (Html.document##getElementById (string x))
let require_def x = Optdef.get x (fun () -> failwith "Undefined content")
let set_content node text = Unsafe.set node (string "textContent") text
let set_html_content node text = Unsafe.set node (string "innerHTML") text

let board_canvas = require_content (Html.CoerceTo.canvas (require_element "ground"))
let board_ctxt = board_canvas##getContext(Html._2d_)
let preview_canvas = require_content (Html.CoerceTo.canvas (require_element "preview"))
let preview_ctxt = preview_canvas##getContext(Html._2d_)

let int_cell_size = preview_canvas##height / piece_size_y
let cell_size = float_of_int int_cell_size

let board_size_x = board_canvas##width / int_cell_size
let board_size_y = board_canvas##height / int_cell_size

let draw_or_erase_cell draw ctxt (x, y) =
  let cs = cell_size in
    if draw
    then ctxt##fillRect((float_of_int x) *. cs, (float_of_int y) *. cs, cs, cs)
    else ctxt##clearRect((float_of_int x) *. cs, (float_of_int y) *. cs, cs, cs)

let draw_or_erase_piece draw ctxt piece (x, y) =
  for j = 0 to Array.length piece - 1 do
    for i = 0 to Array.length piece.(j) - 1 do
      if piece.(j).(i)
      then draw_or_erase_cell draw ctxt (x+i, y+j)
    done
  done

let clear_board () =
  board_ctxt##clearRect
    (0., 0.,
     (float_of_int board_canvas##width),
     (float_of_int board_canvas##height))

let fill_board () =
  board_ctxt##fillRect
    (0., 0.,
     (float_of_int board_canvas##width),
     (float_of_int board_canvas##height))

let clear_preview () =
  preview_ctxt##clearRect
    (0., 0.,
     (float_of_int preview_canvas##width),
     (float_of_int preview_canvas##height))

let fill_preview () =
  preview_ctxt##fillRect
    (0., 0.,
     (float_of_int preview_canvas##width),
     (float_of_int preview_canvas##height))

let draw_board board =
  clear_board () ;
  for j = 0 to Array.length board - 1 do
    for i = 0 to Array.length board.(j) - 1 do
      if board.(j).(i)
      then draw_or_erase_cell true board_ctxt (i, j)
    done
  done

(** {3 Game play} *)

type state =
    { mutable playing        : bool ;
      mutable board          : bool array array ;
      mutable next_piece     : int * int ;
      mutable current_piece  : int * int ;
      mutable x              : int ;
      mutable y              : int ;
      mutable lines          : int              }

let log_matrix =
  Array.iter
    ( fun l ->
        let s = String.make (Array.length l) '_' in
          Array.iteri
            (fun i b -> if b then s.[i] <- '#')
            l ;
          Firebug.console##log(s) )

let log_state state =
  Firebug.console##log_4(string "playing", bool state.playing, string "score", state.lines) ;
  Firebug.console##log(string "board") ;
  log_matrix state.board ;
  Firebug.console##log_3(string "current piece is at position: ", state.x, state.y) ;
  log_matrix pieces.(fst state.current_piece).(snd state.current_piece) ;
  Firebug.console##log(string "next") ;
  log_matrix pieces.(fst state.next_piece).(snd state.next_piece)

let draw_or_erase_current_piece draw state =
  draw_or_erase_piece draw board_ctxt
    pieces.(fst state.current_piece).(snd state.current_piece)
    (state.x, state.y)

let current_state =
  ref { playing        =  false ;
        board          =  [||] ;
        next_piece     =  (0, 0) ;
        current_piece  =  (0, 0) ;
        x              =  0 ;
        y              =  0 ;
        lines          =  0      }

let move_if_possible left_or_right state =
  let d = if left_or_right then -1 else 1 in
  let cur_piece = pieces.(fst state.current_piece).(snd state.current_piece) in
    if test_fitting state.board cur_piece (state.x+d, state.y)
    then
      ( draw_or_erase_current_piece false state ;
        state.x <- state.x+d ;
        draw_or_erase_current_piece true state )

(** [player_moves ()] sets the callback for the player-generated events
    binding to the current state *)
let player_moves () =
  let cb k =
    let st = !current_state in
    let cur_piece = pieces.(fst st.current_piece).(snd st.current_piece) in
      if st.playing
      then
        ( match k##keyCode with
            | 37 -> (*left*)
                move_if_possible true st ;
                k##stopPropagation()
            | 39 -> (*right*)
                move_if_possible false st ;
                k##stopPropagation()
            | 38 -> (*up*)
                let r = rotate_piece st.board st.current_piece (st.x, st.y) in
                  if r <> st.current_piece
                  then
                    ( draw_or_erase_current_piece false st ;
                      st.current_piece <- r ;
                      draw_or_erase_current_piece true st ) ;
                  k##stopPropagation()
            | 32 -> (*space*)
                draw_or_erase_current_piece false st ;
                st.y <- last_fitting st.board cur_piece (st.x, st.y) ;
                draw_or_erase_current_piece true st ;
                k##stopPropagation()
            | _ -> () )
  in
  let kh = jsnew Goog.Events.keyHandler (some (Goog.Tools.Union.i2 Html.document)) in
    listen (Goog.Tools.Union.i1 kh) (string "key") (wrap_callback cb) null

let state_new_piece state =
  clear_preview () ;
  draw_board state.board ;
  state.current_piece <- state.next_piece ;
  state.next_piece <- random_piece () ;
  draw_or_erase_piece true preview_ctxt pieces.(fst state.next_piece).(0) (0, 0) ;
  state.x <- (board_size_x - piece_size_x) / 2 ;
  state.y <- board_size_y - 1 ;

  match first_fitting state.board pieces.(fst state.current_piece).(0) (state.x, state.y) with
    | None -> false
    | Some y ->
        state.y <- y ;
        draw_or_erase_current_piece true state ;
        (* log_state state ; *)
        true

let machine st () =
  if not st.playing
  then
    false
  else
    let cur_piece = pieces.(fst st.current_piece).(snd st.current_piece) in
      if test_fitting st.board cur_piece (st.x, st.y-1)
      then
        ( draw_or_erase_current_piece false st ;
          st.y <- st.y-1 ;
          draw_or_erase_current_piece true st ;
          true )
      else
        ( (* The piece must be fixed, etc. until a new one is introduced *)
          insert_piece st.board cur_piece (st.x, st.y) ;
          st.lines <- st.lines + gobble_full_lines st.board ;
          set_content (require_element "lines") (string (string_of_int st.lines)) ;
          if state_new_piece st
          then true
          else (* Game Over *)
            ( st.playing <- false ;
              fill_preview () ;
              false ) )

let start_new_play _ =
  !current_state.playing <- false ;
  clear_board () ;
  clear_preview () ;
  set_content (require_element "lines") (string "0") ;
  let st =
    { playing        =  true ;
      board          =  make_board (board_size_x, board_size_y) ;
      next_piece     =  random_piece () ;
      current_piece  =  (0, 0) ;
      x              =  (board_size_x - piece_size_x) / 2 ;
      y              =  board_size_y - 1 ;
      lines          =  0                                       } in

    if state_new_piece st
    then
      ( current_state := st ;
        repeat_until_false (machine st) 150 ;
        _false )
    else failwith "Board too small to play"

let onload _ =
  let start = require_element "start" in
    start##onclick <- Html.handler start_new_play ;
    player_moves () ;
    _false

let _ =
  Html.window##onload <- Html.handler onload

